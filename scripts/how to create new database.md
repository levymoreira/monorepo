sudo -u postgres psql 
create database automapost owner monorepouser;
GRANT ALL PRIVILEGES ON DATABASE automapost TO monorepouser;
ALTER USER monorepouser CREATEDB;