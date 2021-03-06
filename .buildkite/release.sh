STAGE=$BUILDKITE_BRANCH
if [ "$STAGE" = 'main' ]; then
  STAGE='production'
fi

if [ "$STAGE" != 'production' ] && [ "$STAGE" != 'staging' ]; then
  echo 'Stage '$STAGE' unknown, skipping deploy'
  exit 0
fi

cd /opt/docker/arora-discord/$STAGE || exit
docker-compose pull app
docker-compose build app
docker-compose run --rm app npx sequelize-cli db:migrate
docker-compose up -d app
