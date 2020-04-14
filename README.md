# redmine playground

redmine(v4.0) + mysql(v5.7)

## redmine 永続化対象

* redmine files(/usr/src/redmine/files)
  * docker volumeを利用
* redmine plugins(/usr/src/redmine/plugins)
* redmine public/themes(/usr/src/redmine/public/themes)
* redmine config(/usr/src/redmine/config/configuration.yaml)

DBはmysqlコンテナを利用

## mysql 永続化対象

* db data
  * docker volumeを利用

## How to play

```bash
$ docker-compose up -d
$ open http://localhost:3080/
```
