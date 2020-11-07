# Orion Setup Guide
This guide will help you install and configure an instance of the Orion project. Should you have any questions or suggestions, please open a new issue with the respective template.

## Getting started
You will need the most recent releases of OrionServer and OrionPanel. The release binary of OrionBot is already included in the archive of the Server, but you may download and replace it manually.

Download the releases ([**Server**](https://github.com/Raffy27/OrionServer/releases) and [**Panel**](https://github.com/Raffy27/OrionPanel/releases)) and extract the archives into separate directories.

Alternatively, you may clone the repositories and compile the code on your own. 

### Local setup
1. Start the Server by running `Server\Start.bat`. This will run OrionServer and Tor (with the custom settings needed for local administration and debugging). You might be prompted for a Firewall Exception. You will see two console windows pop up.
2. Start the Panel by running `Panel\Panel.exe`.
3. A Login window will pop up, enter the default credentials: **admin** - **admin**.

After this, you should have full access to the features of the Panel.

The release is automatically configured for a local setup. The Gate Location (address of the server) is `https://localhost:1337/` by default. The Panel will only be able to connect to the Server locally. Similarly, the bots built with this setup will only work on the computer the server is running on (they will connect to localhost).

### Remote setup
1. Start the Server by running `Server\Start.bat`. This will run OrionServer and Tor. You might be prompted for a Firewall Exception. 
2. Take note of the onion address in `Server\Hosting\Config\hostname`. Example: `orion7anqmteurdnnhh4pdwlrma57ecnlzczpq4b7omep7f3tb2db3id.onion`.
3. Get a self-signed SSL Certificate for your onion address [**here**](https://www.selfsignedcertificate.com/).
4. Save the **.key** file obtained from the previous step as `Certificate\private.key` and the **.cert** file as `Certificate\certificate.crt`.
5. Restart the Server.
6. Open `Panel\Panel.exe.config` in a text editor. Tor will also start.
7. Replace `https://localhost:1337/` under `<setting name="GateLocation" ...>` with your onion address from step 2, **in the following format**: `https://<address>:7019/`. Save your changes.
8. Start the Panel by running `Panel\Panel.exe`.
9. A Login window will pop up, enter the default credentials: **admin** - **admin**.

After this, you should have full access to the features of the Panel.

This configuration will allow you to run the Server on a given computer, and access it with the Panel from another computer. Similarly, the bots built with this setup will work regardless of the computer or the network they are running on. Be aware that depending on your jurisdiction, it may be **illegal** to deploy bots to a system you do not own!

### Additional modules
* The password recovery module depends on LaZagne. Get the release binary from [**the original repository**](https://github.com/AlessandroZ/LaZagne/releases) and save it as `Server\Files\lazagne.exe`.
* The cryptocurrency mining module depends on Nanominer. Get the release archive from [**the original repository**](https://github.com/nanopool/nanominer/releases) and save it as `Server\files\miner.zip`. <details>
    <summary><b>Required structure</b></summary>
    
    ```txt
    miner.zip
    ├── nanominer.exe
    ├── config.ini
    └── ...
    ```
    The bot will replace the variable **%rigName%** (in **config.ini**) with a unique worker name.
</details>

* Tor can be updated to the latest version (see the [**Tor Expert Bundle**](https://www.torproject.org/download/tor/)) but `Panel\Builder\Tor.zip >> Tor\` has to contain **libeay32.dll** and **ssleay32.dll**. These are dependencies of OrionBot.

### Database management

Databases are stored as separate XML files under `Server\Database\`. Database names are self-explanatory.
The server will perform an autosave every 5 minutes. This overwrites the contents of the Databases with that of the ones in the memory of the Server (for example, writes the information of new bots to the disk). To modify the databases, stop the Server first.

To add a new Master user, simply add a line in **Users.xml**:
```xml
<users>
    ...
    <user id="2" user="admin" pass="8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918" role="Master"/>
</users>
```
Passwords are unsalted SHA-256 hashes. Alternatively, you can issue a command to the Server:
```shell
newuser Username PlaintextPassword Role
```
And then test if the user was added correctly using
```shell
login Username PlaintextPassword
```

### Ports

The Server listens locally on port **1337**.

Tor is configured to route external traffic from port **7019** to port **1337** (the Server). See `Server\Hosting\Config\torrc.config` for details.

The Panel also requires Tor access. An HTTP Tunnel should be established on port **7979**. See the [Manual](https://2019.www.torproject.org/docs/tor-manual.html.en) for details.

### Notes
* The format of the Gate Location is fixed. Note the `https://` at the beginning and the **trailing slash**!
* To gracefully close the server (and perform an autosave), **focus on the console window and press Ctrl+C instead of closing the window**!
* Orion works with Tor. Although the Panel >> Builder has an "Include Tor" option, this **has to be enabled** in most cases, even if your server is not routed through Tor, but simply uses HTTPS.
* `Server\Files\build.bin` is the release binary of OrionBot. This binary must not contain [Resources](https://en.wikipedia.org/wiki/Resource_(Windows)) related to build settings.
* If you have the private key to a custom Hidden Service (such as a [vanity address](https://github.com/cathugger/mkp224o)), you can replace the respective files under `Server\Hosting\Config\` and restart Tor to use it.
* Settings of the Panel are stored under `%LocalAppdata%\Panel\`. If you wish to reset the Panel or you accidentally changed an important setting and can't log in, you can just delete this folder.

## License
This project is licensed under the MIT License -  see the <a href="https://github.com/Raffy27/OrionServer/blob/master/LICENSE" target="_blank">LICENSE</a> file for details. For the dependencies, all rights belong to their respective owners. These should be used according to their respective licenses.
