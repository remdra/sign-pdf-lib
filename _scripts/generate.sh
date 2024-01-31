#!/bin/bash

set -e -u +x


PASSWORD=password

CERTIFICATES_FOLDER=certificates
CA_CERTIFICATES_FOLDER=certificates/ca
INTERMEDIATE_CERTIFICATES_FOLDER=certificates/intermediate
ENTITY_CERTIFICATES_FOLDER=certificates/entity

rm -rf $CERTIFICATES_FOLDER

mkdir -p $CA_CERTIFICATES_FOLDER
mkdir -p $CA_CERTIFICATES_FOLDER/private
mkdir -p $CA_CERTIFICATES_FOLDER/certs
mkdir -p $CA_CERTIFICATES_FOLDER/newcerts

touch $CA_CERTIFICATES_FOLDER/index.txt
echo 'unique_subject = no' >> $CA_CERTIFICATES_FOLDER/index.txt.attr
echo 1000 > $CA_CERTIFICATES_FOLDER/serial


openssl genrsa \
    -aes256 \
    -passout pass:$PASSWORD \
    -out $CA_CERTIFICATES_FOLDER/private/ca.key.pem \
    4096
openssl req \
    -new \
    -x509 \
    -sha256 \
    -days 7300  \
    -subj "/C=RO/ST=Timis/L=Timisoara/O=Sign Pdf Lib/OU=Signing/CN=Sign Pdf Lib CA" \
    -passin pass:$PASSWORD \
    -config openssl-ca.cnf \
    -extensions v3_ca \
    -key $CA_CERTIFICATES_FOLDER/private/ca.key.pem \
    -out $CA_CERTIFICATES_FOLDER/certs/ca.cert.pem
openssl pkcs12 \
    -export \
    -passin pass:$PASSWORD \
    -passout pass:$PASSWORD \
    -out $CA_CERTIFICATES_FOLDER/certs/ca.cert.p12 \
    -in $CA_CERTIFICATES_FOLDER/certs/ca.cert.pem \
    -inkey $CA_CERTIFICATES_FOLDER/private/ca.key.pem
## openssl x509 -noout -text -in $CA_CERTIFICATES_FOLDER/certs/ca.cert.pem

mkdir -p $INTERMEDIATE_CERTIFICATES_FOLDER
mkdir -p $INTERMEDIATE_CERTIFICATES_FOLDER/private
mkdir -p $INTERMEDIATE_CERTIFICATES_FOLDER/csr
mkdir -p $INTERMEDIATE_CERTIFICATES_FOLDER/certs
mkdir -p $INTERMEDIATE_CERTIFICATES_FOLDER/newcerts

touch $INTERMEDIATE_CERTIFICATES_FOLDER/index.txt
touch $INTERMEDIATE_CERTIFICATES_FOLDER/index.txt.attr
echo 'unique_subject = no' >> $INTERMEDIATE_CERTIFICATES_FOLDER/index.txt.attr
echo 1000 > $INTERMEDIATE_CERTIFICATES_FOLDER/serial

mkdir -p $ENTITY_CERTIFICATES_FOLDER
mkdir -p $ENTITY_CERTIFICATES_FOLDER/private
mkdir -p $ENTITY_CERTIFICATES_FOLDER/csr
mkdir -p $ENTITY_CERTIFICATES_FOLDER/certs
##mkdir -p $ENTITY_CERTIFICATES_FOLDER/newcerts


openssl genrsa \
    -aes256 \
    -passout pass:$PASSWORD \
    -out $INTERMEDIATE_CERTIFICATES_FOLDER/private/intermediate.key.pem \
    4096
openssl req \
    -new \
    -sha256 \
    -subj "/C=RO/ST=Timis/L=Timisoara/O=Sign Pdf Lib/OU=Signing/CN=Sign Pdf Lib Intermediate" \
    -passin pass:$PASSWORD \
    -config openssl-ca.cnf \
    -key $INTERMEDIATE_CERTIFICATES_FOLDER/private/intermediate.key.pem \
    -out $INTERMEDIATE_CERTIFICATES_FOLDER/csr/intermediate.csr.pem
openssl ca \
    -batch \
    -passin pass:$PASSWORD \
    -config openssl-ca.cnf \
    -extensions v3_intermediate_ca \
    -days 3650 \
    -notext \
    -md sha256 \
    -in $INTERMEDIATE_CERTIFICATES_FOLDER/csr/intermediate.csr.pem \
    -out $INTERMEDIATE_CERTIFICATES_FOLDER/certs/intermediate.cert.pem
openssl pkcs12 \
    -export \
    -passin pass:$PASSWORD \
    -passout pass:$PASSWORD \
    -out $INTERMEDIATE_CERTIFICATES_FOLDER/certs/intermediate.cert.p12 \
    -in $INTERMEDIATE_CERTIFICATES_FOLDER/certs/intermediate.cert.pem \
    -inkey $INTERMEDIATE_CERTIFICATES_FOLDER/private/intermediate.key.pem
## openssl x509 -noout -text -in $INTERMEDIATE_CERTIFICATES_FOLDER/certs/intermediate.cert.pem
cat $INTERMEDIATE_CERTIFICATES_FOLDER/certs/intermediate.cert.pem $CA_CERTIFICATES_FOLDER/certs/ca.cert.pem > $INTERMEDIATE_CERTIFICATES_FOLDER/certs/ca-chain.cert.pem

openssl genrsa \
    -aes256 \
    -passout pass:$PASSWORD \
    -out $ENTITY_CERTIFICATES_FOLDER/private/signing-entity-1.key.pem \
    2048
openssl req \
    -new \
    -sha256 \
    -subj "/C=RO/ST=Timis/L=Timisoara/O=Sign Pdf Lib/OU=Signing/CN=Test Signer/emailAddress=signer@semnezonline.ro" \
    -passin pass:$PASSWORD \
    -config openssl-intermediate.cnf \
    -key $ENTITY_CERTIFICATES_FOLDER/private/signing-entity-1.key.pem \
    -out $ENTITY_CERTIFICATES_FOLDER/csr/signing-entity-1.csr.pem
openssl ca \
    -batch \
    -passin pass:$PASSWORD \
    -config openssl-intermediate.cnf \
    -extensions sign_cert \
    -days 370 \
    -notext \
    -md sha256 \
    -in $ENTITY_CERTIFICATES_FOLDER/csr/signing-entity-1.csr.pem \
    -out $ENTITY_CERTIFICATES_FOLDER/certs/signing-entity-1.cert.pem
openssl pkcs12 \
    -export \
    -passin pass:$PASSWORD \
    -passout pass:$PASSWORD \
    -out $ENTITY_CERTIFICATES_FOLDER/certs/signing-entity-1.cert.p12 \
    -in $ENTITY_CERTIFICATES_FOLDER/certs/signing-entity-1.cert.pem \
    -inkey $ENTITY_CERTIFICATES_FOLDER/private/signing-entity-1.key.pem
## openssl x509 -noout -text -in $ENTITY_CERTIFICATES_FOLDER/certs/signing-entity-1.cert.pem

cp $ENTITY_CERTIFICATES_FOLDER/certs/signing-entity-1.cert.p12  ../assets/certificate.p12
cp $ENTITY_CERTIFICATES_FOLDER/private/signing-entity-1.key.pem ../assets/key.pem
cp $ENTITY_CERTIFICATES_FOLDER/certs/signing-entity-1.cert.pem  ../assets/certificate.pem

## openssl x509 -noout -text -in $ENTITY_CERTIFICATES_FOLDER/certs/signing-entity-1.cert.p12 -passin pass:$PASSWORD -purpose

echo
echo Done.
echo
