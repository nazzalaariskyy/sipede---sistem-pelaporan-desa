
/**
 * @param {import("knex").Knex} knex
 */

exports.up = function (knex) {
    return knex.schema.createTable('users', function (table) {
        table.bigIncrements('id').primary();

        table.string('name', 100).notNullable();
        table.string('email', 150).notNullable().unique();
        table.string('password', 255).notNullable();
        table.string('phone', 20);

        table.enu('role', ['warga', 'admin'])
            .notNullable()
            .defaultTo('warga');

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users');
};
