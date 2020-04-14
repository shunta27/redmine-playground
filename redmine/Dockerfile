FROM redmine:4.0

ENV TZ Asia/Tokyo
# ENV REDMINE_DB_MYSQL mysql

# プラグインのコピー
COPY plugins /usr/src/redmine/plugins

# テーマのコピー
COPY themes /usr/src/redmine/public/themes

# configurationファイルのコピー
COPY config/configuration.yml /usr/src/redmine/config/
