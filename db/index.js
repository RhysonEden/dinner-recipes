const { Client } = require("pg");

const client = new Client("postgres://localhost:5432/recipes-dev");

async function updateUser(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
      UPDATE users
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function createRecipe({ authorId, title, ingredients, content }) {
  try {
    const result = await client.query(
      `
      INSERT INTO recipes("authorId", title, ingredients, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [authorId, title, ingredients, content]
    );
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username 
    FROM users;
  `
  );

  return rows;
}

async function updatePost(postId, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
    if (setString.length > 0) {
      await client.query(
        `
        UPDATE posts
        SET ${setString}
        WHERE id=${postId}
        RETURNING *;
      `,
        Object.values(fields)
      );
    }
  } catch (error) {
    throw error;
  }
}

async function getRecipesById(postId) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      SELECT *
      FROM posts
      WHERE id=$1;
    `,
      [postId]
    );

    if (!post) {
      throw {
        name: "PostNotFoundError",
        message: "Could not find a post with that postId",
      };
    }

    const {
      rows: [author],
    } = await client.query(
      `
      SELECT id, username
      FROM users
      WHERE id=$1;
    `,
      [post.authorId]
    );
    return post;
  } catch (error) {
    throw error;
  }
}

async function getRecipesByUser(userId) {
  try {
    const { rows: postIds } = client.query(`
      SELECT id
      FROM recipes
      WHERE "authorId"=${userId};
    `);

    console.log("Are they there?:", postIds);
    const recipes = await Promise.all(
      postIds.map((post) => getRecipesById(post.id))
    );

    return recipes;
  } catch (error) {
    console.log("Recipe by ID error:", error);
    throw error;
  }
}

async function getAllRecipes() {
  try {
    const { rows: id } = await client.query(`
      SELECT *
      FROM recipes;
    `);
    console.log("Line 142", { rows: id });
    const recipes = await Promise.all(
      rows.map((recipe) => getRecipesByUser(recipe.id))
    );
    console.log("Line 145", recipes);
    return recipes;
  } catch (error) {
    console.log("this is the error:", error);
    throw error;
  }
}

async function createUser({ username, password }) {
  try {
    const result = await client.query(
      `
      INSERT INTO users(username, password)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `,
      [username, password]
    );

    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createRecipe,
  getAllRecipes,
  getRecipesById,
};
