if [ $OSTYPE = "darwin14" ]; then
    echo "Installing dependencies on MacOS"
    
    if ! which brew; then 
        echo "installing homebrew package manager"
        ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    fi

    for pkg in node ffmpeg git; do
        if brew list -1 | grep -q "^${pkg}\$"; then
            echo "Package '$pkg' is already installed"
        else
            echo "Package '$pkg' is not installed"
            echo "Installing package '$pkg'"
            brew install $pkg
        fi
    done

    echo "Installing server"

    echo "Configuring launchd"


else
    echo "This is not MacOS, please use the correct installer."
fi