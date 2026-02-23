/**
 * Inline script injected into Swagger UI to add an "Export" button.
 * Fetches the full OpenAPI spec from the server (JSON or YAML) and triggers download
 * so nothing is missing from the exported document.
 */
export const SWAGGER_EXPORT_BUTTON_SCRIPT = `
(function() {
  var BTN_ID = 'blih-swagger-export-wrapper';

  function getSpecBaseUrl() {
    var path = window.location.pathname.replace(/\\/$/, '');
    if (path.endsWith('/api/docs')) {
      return window.location.origin + path;
    }
    if (path.endsWith('/api')) {
      path = path + '/docs';
    } else {
      path = path + '/api/docs';
    }
    return window.location.origin + path;
  }

  function downloadSpec(format) {
    var base = getSpecBaseUrl();
    var url = format === 'yaml' ? base + '/openapi.yaml' : base + '/openapi.json';
    var filename = format === 'yaml' ? 'openapi.yaml' : 'openapi.json';
    var mime = format === 'yaml' ? 'application/x-yaml' : 'application/json';
    fetch(url).then(function(r) {
      if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
      return r.text();
    }).then(function(text) {
      var blob = new Blob([text], { type: mime });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }).catch(function(e) {
      alert('Export failed: ' + e.message);
    });
  }

  var btnStyle = 'padding:8px 16px;font-size:13px;font-weight:500;color:#fff;background:#4990e2;border:none;border-radius:4px;cursor:pointer;font-family:inherit;margin-left:6px;';
  var boxStyle = 'position:fixed;top:14px;right:14px;z-index:2147483647;display:inline-flex;align-items:center;background:#2d2d2d;padding:10px 14px;border-radius:6px;box-shadow:0 2px 12px rgba(0,0,0,0.4);border:1px solid #444;';

  function addExportButton() {
    if (document.getElementById(BTN_ID)) return;
    var container = document.createElement('div');
    container.id = BTN_ID;
    container.setAttribute('style', boxStyle);
    var btnJson = document.createElement('button');
    btnJson.type = 'button';
    btnJson.setAttribute('style', btnStyle);
    btnJson.textContent = 'Export JSON';
    btnJson.title = 'Download OpenAPI spec as JSON';
    btnJson.onclick = function() { downloadSpec('json'); };
    var btnYaml = document.createElement('button');
    btnYaml.type = 'button';
    btnYaml.setAttribute('style', btnStyle);
    btnYaml.textContent = 'Export YAML';
    btnYaml.title = 'Download OpenAPI spec as YAML';
    btnYaml.onclick = function() { downloadSpec('yaml'); };
    container.appendChild(btnJson);
    container.appendChild(btnYaml);
    document.body.appendChild(container);
  }

  function run() { addExportButton(); }

  function schedule() {
    run();
    setTimeout(run, 400);
    setTimeout(run, 1200);
    setTimeout(run, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }
  window.addEventListener('load', schedule);
})();
`;

export const SWAGGER_EXPORT_BUTTON_CSS = `
.blih-export-spec-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.blih-export-spec-wrapper.blih-export-spec-fixed {
  position: fixed;
  top: 14px;
  right: 14px;
  z-index: 2147483647;
  margin-left: 0;
  background: #2d2d2d;
  padding: 10px 14px;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.4);
  border: 1px solid #444;
}
.blih-export-spec-btn {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: #4990e2;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
}
.blih-export-spec-btn:hover {
  background: #357abd;
}
.blih-export-spec-btn:active {
  background: #2a6ba5;
}
`;
