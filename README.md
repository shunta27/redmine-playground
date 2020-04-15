# redmine playground

redmine(v3.4) + mysql(v5.5) + mailhog(smtp)

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
$ docker exec -it redmine rake redmine:plugins:migrate RAILS_ENV=production
$ docker-compose restart

# redmine
$ open http://localhost:8024/
# mailhog
$ open http://localhost:8025/
```
