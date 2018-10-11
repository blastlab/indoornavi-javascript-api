## Make project

In console:
```
grunt
```
It will make a single file file: output/indoorNavi.spec.js

## Make tests

In console:
```
grunt test
```
It will make a single file file: output/indoorNavi.js

## Run tests

```
npm run test
```

## Create documentation

1. [install globally](https://github.com/jsdoc3/jsdoc)
2. then run this command:

```
jsdoc path_to_indoorNavi.js
```

## Serve index html

For api preview purposes HTML file showing api use has been created. To serve the file to play with it, please follow description below. 

You need to have python3 installed on your system. Click on link to get new [Python3](https://www.python.org/downloads/)

Install virtual environment in project root folder: ``` pip install virtualenv```

Create virtual environment: ```virtualenv my_venv_name```

Start virtual environment: ```source my_venv_name/bin/activate```

Install flask web server framework: ```pip install flask```

Run server: ```python main.py```

This is going to start server at ``` http://127.0.0.1:3000 ```

## Rules for developing this API:

### Documentation: 

1. Documentation is necessary for each api element.

2. Documentation should follow [JSDOC](http://usejsdoc.org) schema.

3. Description should to contain at list one example of class and class method use.

### Naming:

1. All public classes should have a prefix "In" before them to avoid conflicts between libraries.
For example use: ```INPolyline```
In prefix simply means that class belongs to IndorNavi API, and as such will be interpreted by API user.

2. Methods naming should fallow below schema: ```actionTarget```

Which means it is mandatory to use camel case notation starting from small letter, then each next word that is a part of method name should start from the capital letter.
First word describes action that is going to be taken - a verb.
Second word describes a target of taken action - a noun.

3. Arguments in methods are always a noun and starts from small letter.

### Fluent API:

1. API should be written following the "soft rule" of [fluent API](https://www.tutorialspoint.com/entity_framework/entity_framework_fluent_api.html), and by "soft rule" is meant to not force this API to be fluent in every end point of this API.

2. For methods that are returning values or API sensitive information it is recommended to avoid fluent API rule by all means.

Example of cases where fluid API is not recommended: ```area.isWithin(point);``` as it returns boolean value that answers the question is given point within area  that method is called upon.

3. For methods that are not returning values or API sensitive information it is recommended to use fluent API rule.

Example of cases where fluid API is recommended: ```area.setOpacity();``` as it do not returns any value.
