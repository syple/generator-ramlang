# generator-ramlang

## Introduction
> RAMLang is a simple and easy to use command line tool. It's main usage is for generating [AngularJS](http://angularjs.org) services which help communicate with RESTful API's.  
> How it works is it takes the provided [RAML](http://raml.org/) spec document, read's it and generates the AngularJS services in it's own contained Angular module.  
> Optionally you can choose which API resource you want to generate. 

## Prerequisites
> [node.js](http://nodejs.org/) ~0.10.0  
> [Yeoman](http://yeoman.io) ~1.0.0

## Getting Started

Please make sure that you have all the prerequisites installed before continuing.

To install run:

``$ npm install -g generator-ramlang``

Finally, initiate the generator:

``$ yo ramlang``

##Usage

####First off
> When running RAMLang, it should be run from your projects root directory.
Once run you will need to provide the name of the Anuglar module. 

_Please note that the name will be suffixed with **'-api'**. If you provide **'api'** then it will not be suffixed._

> You have complete control on how you want to format the name, just keep in mind that the name will also be used as the file name of the generated file.

    [?] What would you like to call the module: api

> The way RAMLang decides which RAML file to use is first by checking if there are RAML files in the current working directory.  
> If there is only one file then it wont prompt you to choose a file. When multiple files are found then you can choose which one you want to use or optionally provide the path to a RAML file by choosing 'Custom'.  
> If there is no RAML file found or you have chosen 'Custom' then you need to provide a file path, http or https url to the RAML file.

_Note: RAML files that are downloaded will be placed in the current working directory._
  
#####Example with multiple choises:  

    [?] Which RAML file would you like to use: (Use arrow keys)
      ❯ some.raml
        more.raml
        Custom
   
#####Example chosing 'Custom':

    [?] Which RAML file would you like to use: Custom          
    [?] I need the path to your RAML file. This can be a url (http|https): ~/Downloads/some.raml

> Once you have selected the RAML file then the generator will read it and you can optionally choose which resources will be generated. 

    Angular application module name: customer
    Chosen RAML file:  some.raml 
         
    Reading RAML file.✔ 
    
    [?] Would you like to generate all resources: (Y/n) 

> If **no** is provided then a list of resources that can be generated will be displayed:

    [?] Would you like to generate all resources: No     
    [?] Select which resources you want to generate: (Press <space> to select)
    ❯⬢ Departments
     ⬡ Staff
     ⬡ Payroll
     ⬢ Reports
    (Move up and down to reveal more choices)

####Half way now...

> After selecting which resources to generate you can choose to generate all of the resources into one file or split them out into there own file.

_Note: The directory structure is based off the final step._

#####Example structure when split
    ├── app
        ├── scripts
            ├──services
                ├── api
                    ├── api.js
                    ├── api-provider.js
                    ├── department.js
                    └── report.js

#####Example structure when all in one file:
    ├── app
        ├── scripts
            ├──services
                ├── api
                    └── api.js

####Finally
> The last thing we need to do is tell the generator where to put all of the files. You can choose the current working directory or RAMLang try's to find the best location for you.  
> The way it does this is by checking if you are using [Bower](http://bower.io/) and if so gets the directory path from the **'.bowerrc'** file. As a second resort it will find where the 'bower_components' directory is and use it's parent directory. If you don't have Bower installed in your project then you can provide the directory structure.

#####Example when Bower is installed and '.bowerrc' file exists:
######Contents of the Bower config file:

    {
        "directory": "app/bower_components"
    }

######Result:

    This is where i'm going to generate the files: 
                 
    app/scripts/services/api
         
     Is this correct: (Y/n)

#####Example when Bower is install and '.bowerrc' file doesn't exist:
######Location of 'bower_components':

    app/bower_components

######Result:

    This is where i'm going to generate the files: 
                 
    app/scripts/services/api
         
     Is this correct: (Y/n)

##### Example when Bower is not installed and 'no' was provided

    [?] Generate all files in the current directory: No     
    [?] Supply the correct path: app/scripts/api


####Done!!!
After all of that the generator will generate all of the resources.

##Options
> There are a few options you can supply when running the generator.

    $ yo ramlang --help
    
      Usage:
        yo ramlang [options] 

      Options:
        -h,   --help         # Print generator's options and usage                   Default: false
              --save         # Stores all answers to a file.                         Default: false
              --clean        # Indicates that you want to ignore any saved answers.  Default: false
              --force        # Suppresses prompting when saving files.               Default: false
              --welcome-off  # Doesn't display the welcome message.                  Default: false

###Saving configuration
> Going through the whole process to generate the resources can be a bit much if you need to run the generator more than once and all of the answers to the prompts are the same. By supplying the **'--save'** option, this will tell RAMLang to save all of the answers to a config file **(.ramlang)** in the current working directory. The next time you run RAMLang it will use the saved config values.

###Overriding configuration
> If you don't want to use saved configuration values then supply the **'--clean'** option. This will ignore the configuration values. You can also save over an existing config file by supplying both **'--clean'** and **'--save'** options.

###Forcing to override existing files
> When RAMLang generates files, it can prompt you to overwrite a file if it already exists. To ignore this and always provide 'Yes', supply the **'--force'** option. This option will be saved to the configuration if **'--save'** is also supplied.

## License

MIT
