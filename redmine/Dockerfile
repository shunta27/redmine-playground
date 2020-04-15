FROM redmine:3.4

ENV TZ Asia/Tokyo
# ENV REDMINE_DB_MYSQL mysql

# プラグインのコピー
COPY plugins /usr/src/redmine/plugins

# rgloader (usability pluginで使う)
COPY rgloader /usr/src/redmine/rgloader

# テーマのコピー
COPY themes /usr/src/redmine/public/themes

# configurationファイルのコピー
COPY config/configuration.yml /usr/src/redmine/config/
