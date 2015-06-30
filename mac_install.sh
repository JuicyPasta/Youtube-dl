if [ $OSTYPE = "darwin14" ]; then
    echo "Installing dependencies on MacOS"

    if ! which brew; then
        echo "Installing homebrew package manager"
        yes | ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    else
        echo "Homebrew is already installed"
    fi

    for pkg in node ffmpeg git; do
        if brew list -1 | grep -q "^${pkg}\$"; then
            echo "Package '$pkg' is already installed"
        else
            echo "Package '$pkg' is not installed"
            echo "Installing package '$pkg'"
            yes | brew install $pkg
        fi
    done

    echo "Installing server in /opt/Youtube-dl"

    cd /opt
    sudo rm -rf ./Youtube-dl
    sudo git clone https://github.com/JuicyPasta/Youtube-dl.git ./Youtube-dl
    cd ./Youtube-dl
    sudo npm install > /dev/null

    sudo chmod +x youtube-dl-startup.sh

    echo "Configuring launchd"
    sudo mv com.github.youtube-dl.plist ~/Library/LaunchAgents/com.github.youtube-dl.plist

    launchctl start com.github.youtube-dl.plist

    curl -k https://localhost:6299/ping

else
    echo "This is not MacOS, please use the correct installer."
fi
