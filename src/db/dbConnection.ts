import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('yabanci_kelime_task', 'root', '', {
  host: '127.0.0.1',
  dialect: 'mysql',
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to db');
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error', error);
    }
  }
})();

export default sequelize;