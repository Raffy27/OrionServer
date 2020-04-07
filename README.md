# Orion Server
![Commit](https://img.shields.io/github/last-commit/Raffy/OrionBot)
![Release](https://img.shields.io/github/v/release/Raffy27/OrionBot)
![Issues](https://img.shields.io/github/issues/Raffy27/OrionBot)
![Donate](https://img.shields.io/badge/btc-16XsRodnoCKzAWHCELxsfQRUpfviqiWbyR-blueviolet)

OrionServer is the core server of a centralized and versatile remote administration tool, making use of the Tor network to communicate with its clients.

## Features
* Encrypted/Torified connection
* Easy to read XML database
* Colorful and detailed logging
* Static resources for binary building
* Basic interactive commands

## Screenshot
![Console](https://i.imgur.com/oURqnIW.png)

## Getting started
This section covers the recommended software and dependencies needed to compile and debug the project.
The default credentials are **admin - admin**.

### Prerequisites
Dev environment:
* Any code editor that supports JavaScript
* node.js

You need to configure your Tor Hidden Service by modifying the respective files.
You also need an SSL Certificate. Get one for your hidden service <a href="https://www.selfsignedcertificate.com/" target="_blank">**here**</a>.

### Dependencies
* node.js packages
    * body-parser v1.19.0 for parsing web requests
    * chalk v3.0.0 for colorful output
    * express v4.17.1 for the core of the webserver
    * express-fileupload v1.1.6 for accepting files
    * express-session v1.17.0 for basic session management
    * xml2js v0.4.22 for parsing/editing the database
* OrionBot Binary
* Nanominer Release

## Installing
Clone the repository using
```shell
git clone https://github.com/Raffy27/OrionServer
```
Install the required modules
```shell
cd OrionServer
npm install
```
Make sure the required external dependencies are present and up to date.

Start OrionServer by running **Start.bat**.

### Structure
```txt
OrionServer
├── Certificate
│   ├── certificate.crt
│   └── private.key
├── Database
│   ├── Blacklist.xml
│   ├── Bots.xml
│   └── Users.xml
├── Files
│   ├── build.bin
│   ├── lazagne.exe
│   └── miner.zip
├── Hosting
│   ├── Config
│   │   ├── authorized_clients
│   │   ├── hostname
│   │   ├── hs_ed25519_public_key
│   │   ├── hs_ed25519_secret_key
│   │   └── torrc.config
│   └── Tor
│       └── tor.exe
├── app.js
├── bots.js
├── database.js
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── Start.bat
└── users.js
```

## Releases
For active releases and pre-compiled binaries, see <a href="https://github.com/Raffy27/OrionServer/releases" target="_blank">Releases</a>.

## License
This project is licensed under the MIT License -  see the <a href="https://github.com/Raffy27/OrionServer/blob/master/LICENSE" target="_blank">LICENSE</a> file for details. For the dependencies, all rights belong to their respective owners. These should be used according to their respective licenses.