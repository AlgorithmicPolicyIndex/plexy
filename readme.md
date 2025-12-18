# Plexy
Plexy is a personal project I'm working on for an Idea I had back in my NTC rotation.  
Plexy is nothing but a simple App Launcher for Raspberry Pi's, while it will work on any other Operating System.

It is a fullscreen application as I'm building this for a small device that I'm pairing with a 7-inch touch screen display.
This will later turn into a proprietary board and device to make it smaller and specifically designed to run this program at launch.  
Plexy is not designed to do anything but be a launcher, so things like Application Configs and even other things such as Plugins will be handled **ENTIRELY** by the Application itself.
# Applications
Apps for Plexy are also Electron Apps, which are spawned over top of Plexy. Plexy will always be in the background.  
Apps are a one instance only deal, so there should not be 2 apps running at the same time.

Apps located in Plexy's App folder are something that is specifically designed with Plexy in mind.  
This folder is located in your OSs home directory, Linux for example is: `home/user/Plexy`

App that are not under Plexy are not warranted to be safe and should not be expected to be.  
With that being said, Dependencies and other programs **will** be bundled with their respective apps. (*I'll update this when I make my MP3 Player as an example.*)

# Plans
Make a Drag and Drop feature, so it'll autoload the Application to the Application Directory  
Although thinking about it, it's a fullscreen application, this is kind of stupid. But it should be fine, since I do not prevent you from Alt Tabbing, so I think it's a fair thing to have.
