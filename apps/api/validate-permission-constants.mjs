#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, 'src');
const constantsPath = path.join(
  srcRoot,
  'core',
  'rbac',
  'constants',
  'permissions.constants.ts',
);

const isPermissionLiteral = (value) => /^[a-z0-9_]+:[a-z0-9_*-]+$/.test(value);

const readSourceFile = (filePath) =>
  ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

const toChain = (node) => {
  if (ts.isIdentifier(node)) {
    return [node.text];
  }
  if (ts.isPropertyAccessExpression(node)) {
    const left = toChain(node.expression);
    if (!left) {
      return null;
    }
    return [...left, node.name.text];
  }
  return null;
};

const getNamedImportsForPermissionsConstants = (sourceFile) => {
  const importMap = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue;
    }
    const moduleSpecifier = statement.moduleSpecifier.getText(sourceFile);
    if (!moduleSpecifier.includes('permissions.constants')) {
      continue;
    }
    const clause = statement.importClause;
    if (
      !clause ||
      !clause.namedBindings ||
      !ts.isNamedImports(clause.namedBindings)
    ) {
      continue;
    }
    for (const element of clause.namedBindings.elements) {
      const localName = element.name.text;
      const importedName = element.propertyName
        ? element.propertyName.text
        : localName;
      importMap.set(localName, importedName);
    }
  }
  return importMap;
};

const loadPermissionConstantObjects = (sourceFile) => {
  const objectMap = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }
    if (
      !statement.modifiers ||
      !statement.modifiers.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      )
    ) {
      continue;
    }
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) {
        continue;
      }
      const varName = declaration.name.text;
      const init = declaration.initializer;
      const expression =
        ts.isAsExpression(init) && ts.isObjectLiteralExpression(init.expression)
          ? init.expression
          : ts.isObjectLiteralExpression(init)
            ? init
            : null;
      if (!expression) {
        continue;
      }

      const values = new Map();
      let allPropertiesArePermissionLiterals = true;
      for (const property of expression.properties) {
        if (
          !ts.isPropertyAssignment(property) ||
          (!ts.isIdentifier(property.name) &&
            !ts.isStringLiteral(property.name)) ||
          !ts.isStringLiteral(property.initializer)
        ) {
          allPropertiesArePermissionLiterals = false;
          break;
        }
        const key = ts.isIdentifier(property.name)
          ? property.name.text
          : property.name.text;
        const value = property.initializer.text;
        if (!isPermissionLiteral(value)) {
          allPropertiesArePermissionLiterals = false;
          break;
        }
        values.set(key, value);
      }
      if (allPropertiesArePermissionLiterals && values.size > 0) {
        objectMap.set(varName, values);
      }
    }
  }
  return objectMap;
};

const resolvePermissionExpr = (expr, importMap, objectMap) => {
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
    return { kind: 'raw', value: expr.text };
  }
  const chain = toChain(expr);
  if (!chain || chain.length < 2) {
    return { kind: 'unresolved', value: expr.getText() };
  }
  const importedRoot = importMap.get(chain[0]);
  if (!importedRoot) {
    return { kind: 'unresolved', value: expr.getText() };
  }
  if (chain.length !== 2) {
    return { kind: 'unresolved', value: expr.getText() };
  }
  const group = objectMap.get(importedRoot);
  if (!group) {
    return { kind: 'unresolved', value: expr.getText() };
  }
  const slug = group.get(chain[1]);
  if (!slug) {
    return { kind: 'unresolved', value: expr.getText() };
  }
  return { kind: 'resolved', value: slug };
};

const allTsFiles = (root) => {
  const results = [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      results.push(...allTsFiles(fullPath));
      continue;
    }
    if (entry.isFile() && fullPath.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
};

const formatLocation = (sourceFile, node) => {
  const position = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile),
  );
  const relativePath = path.relative(projectRoot, sourceFile.fileName);
  return `${relativePath}:${position.line + 1}:${position.character + 1}`;
};

const constantsSource = readSourceFile(constantsPath);
const permissionObjectMap = loadPermissionConstantObjects(constantsSource);
const allPermissionSlugs = new Set(
  [...permissionObjectMap.values()].flatMap((map) => [...map.values()]),
);

const errors = [];

for (const filePath of allTsFiles(srcRoot)) {
  const sourceFile = readSourceFile(filePath);
  const importMap = getNamedImportsForPermissionsConstants(sourceFile);

  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'Roles'
    ) {
      for (const arg of node.arguments) {
        const resolved = resolvePermissionExpr(
          arg,
          importMap,
          permissionObjectMap,
        );
        if (resolved.kind === 'raw') {
          errors.push(
            `${formatLocation(sourceFile, arg)} raw string is not allowed in @Roles(...). Use typed constants.`,
          );
          continue;
        }
        if (resolved.kind !== 'resolved') {
          errors.push(
            `${formatLocation(sourceFile, arg)} unresolved @Roles(...) argument ${resolved.value}. It must reference permissions.constants exports.`,
          );
          continue;
        }
        if (!allPermissionSlugs.has(resolved.value)) {
          errors.push(
            `${formatLocation(sourceFile, arg)} @Roles value ${resolved.value} is not in AllPermissionSlugs.`,
          );
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
}

if (errors.length > 0) {
  console.error('RBAC permission constant validation failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `RBAC permission constants validated (${allPermissionSlugs.size} slugs).`,
);
