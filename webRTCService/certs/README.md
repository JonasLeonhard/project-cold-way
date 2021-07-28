# Certificates

This folder includes a SAMPLE certificates and key for Janus, that have to be replaced for production!

Change the certificates in ```janus.cfg``` settings.

# Self signed Certificates
Run to create your own .crt and .key for Janus.cfg:

	openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout privateKey.pem -out certificate.pem

To use the certs ```privateKey.key``` &  ```certificate.crt``` in  ```janus.cfg```. Update ```cert_pem``` & ```cert_key``` in ```[certificates]```.