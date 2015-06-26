if [ $OSTYPE = "linux-gnu" ]; then
	echo "Installing dependecies on Linux-gnu"

	sudo apt-get install -y nodejs
	sudo apt-get install -y libav-tools
	sudo apt-get install -y git

	echo "Installing server"
	

else
	echo "This is not Ubuntu, please use the correct installer."
fi	