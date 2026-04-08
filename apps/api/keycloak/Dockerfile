FROM quay.io/keycloak/keycloak:26.0

USER root
RUN microdnf install -y curl && microdnf clean all
USER keycloak
