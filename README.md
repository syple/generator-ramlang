# generator-ramlang

RAMLang is a simple and easy to use command line tool. It's main goal is to provide [AngularJS](http://angularjs.org) services which help communicate with RESTful API's.
How it works is it takes a [RAML](http://raml.org/) spec document and generates the RESTful resources in a contained module. Optionally you can choose which API resource you want to generate and also extent on top on the generated source.

## Prerequisites
[node.js](http://nodejs.org/) ~0.10.0

[Yeoman](http://yeoman.io) ~1.0.0

## Getting Started

Please make sure that you have all the prerequisites installed before continuing.

To install the RAMLang generator:

``$ npm install -g generator-ramlang``

Once done, you can run RAMLang like so:

``$ yo ramlang``

- - -

##Usage

####First off
When running RAMLang, it should be run from your projects root directory.
Once run you will need to provide the name of the module. 

_Please note that the name will be suffixed with **'-api'**. If you provide **'api'** then it will not be suffixed._

You have complete control on how you want to format the name, just keep in mind that the name will also be used as the file name of the AngularJS application file.

#####Example inputing the name of the module

    [?] What would you like to call the module: api

The way RAMLang decides which RAML file to use is by first checking if there are **'.raml'** files in the current working directory. If there is only one file then it wont prompt you to choose a file. When multiple files are found then you can choose which one you want or optionally provide the path to the RAML file by choosing the **'Custom'** option.
If there is no RAML file found or you have chosen **'Custom'** then you need to provide a the file path, http or https url to the RAML file.

_Note: RAML files that are downloaded will be placed in the current working directory._
  
#####Example with multiple choices:  

    [?] Which RAML file would you like to use: (Use arrow keys)
      ❯ some.raml
        more.raml
        Custom
   
#####Example chosing 'Custom' or the RAML file doesn't exist:

    [?] I need the path to your RAML file. This can be a url (http|https): ~/Downloads/some.raml

Once you have selected the RAML file then the generator will read the file.

    Angular application module name: customer
    Chosen RAML file:  some.raml 
         
    Reading RAML file.✔ 

When read, you can choose to generate all of the resources or be able to select the resources to generate.

    [?] Would you like to generate all resources: (Y/n) 

#####Example when you want to choose the resources to generate

    [?] Would you like to generate all resources: No     
    [?] Select which resources you want to generate: (Press <space> to select)
    ❯⬢ Departments
     ⬡ Staff
     ⬡ Payroll
     ⬢ Reports
    (Move up and down to reveal more choices)

####Half way now...

After the generator knows what resources you want to generate then you can choose to generate all of the resources into one file or split them out into there own file.

_Note: The directory structure is based on the final step._

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

The last thing we need to do is to tell the generator where to put the generated resources. You can choose the current working directory otherwise, RAMLang try's to find the best location for you. The way it does this is by checking if you are using [Bower](http://bower.io/) and if so gets the directory path from the **'.bowerrc'** file. As a second resort it will find where the 'bower_components' directory is and use it's parent directory. If you don't have Bower installed in your project then you can provide the directory structure.

#####Example when Bower is installed and the '.bowerrc' file exists:

######Contents of the Bower config file:

    {
        "directory": "app/bower_components"
    }

######Result:

    This is where i'm going to generate the files: 
                 
    app/scripts/services/api
         
     Is this correct: (Y/n)

#####Example when Bower is installed and the '.bowerrc' file doesn't exist:

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
After all that the generator will generate all the resources.

- - -

##Options

There are a few options you can supply when running RAMLang. The easiest way to see all of the supported options is by running RAMLang and suppling the **'--help'** or **'-h'** option.

    $ yo ramlang --help

or

    $ yo ramlang -h

###Saving configuration

Going through the whole process to generate the resources can be a bit much, especially when you need to run the generator multiple times providing the same input to all the prompts. By supplying the **'--save'** option, this will tell RAMLang to save all of the input's for prompts to a configuration file **(.ramlang)** in the current working directory. The next time RAMLang is run it will use the saved configuration values.

    $ yo ramlang --save

###Overriding configuration

If you don't want to use saved configuration values then supplying the **'--clean'** option will tell RAMLang to ignore the saved configuration values. You can also save over an existing configuration by supplying both **'--clean'** and **'--save'** options.

    $ yo ramlang --clean

#####To override saved configuration values

    $ yo ramlang --clean --save

###Suppress file prompts

When RAMLang generates resources, it can prompt you to overwrite a file if it already exists. To ignore this and always override the existing files, supply the **'--force'** option. This option will be saved to the configuration if **'--save'** is also supplied.

    $ yo ramlang --force

#####Save the usage of '--force' to the configuration file

    $ yo ramlang --force --save

## License

MIT
