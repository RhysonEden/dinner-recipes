const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createRecipe,
  getAllRecipes,
  getRecipesById,
} = require("./index");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
      DROP TABLE IF EXISTS recipes;
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL
      );
      CREATE TABLE recipes (
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id),
        title varchar(255) NOT NULL,
        ingredients TEXT NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
    `);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    const katy = await createUser({
      username: "katy",
      password: "march0511",
    });
    const liz = await createUser({
      username: "liz",
      password: "123456",
    });
    const jim = await createUser({
      username: "jim",
      password: "123456",
    });

    console.log(katy, liz, jim);

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function createInitialRecipes() {
  try {
    const [katy, liz, jim] = await getAllUsers();

    await createRecipe({
      authorId: katy.id,
      title: "First Recipe",
      ingredients: "None, this is a test",
      content:
        "This is my first post. I hope I love writing blogs as much as I love writing them.",
    });

    // a couple more
  } catch (error) {
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialRecipes();
  } catch (error) {
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("Result:", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      username: "katy",
      password: "123456",
    });
    console.log("Result:", updateUserResult);

    console.log("Calling getAllRecipes");
    const recipes = await getAllRecipes();
    console.log("Result:", recipes);

    console.log("Finished database tests!");
  } catch (error) {
    console.error("Error testing database!");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
