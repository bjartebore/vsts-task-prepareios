# install
```
git clone https://github.com/bjartebore/vsts-task-prepareios.git
````
install the tfx client if not allready installed
```
npm install -g tfx-cli
````

lag et PAT med "Extensions (read and manage)" rettigheter
```
tfx login 
```


```
cd ./vsts-task-prepareios
tfx build tasks upload --task.path ./
```

