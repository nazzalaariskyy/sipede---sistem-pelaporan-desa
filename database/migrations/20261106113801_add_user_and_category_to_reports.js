
exports.up = function (knex) {
    return knex.schema.alterTable('reports', function (table) {
        table.bigInteger('user_id')
            .unsigned()
            .nullable()
            .references('id')
            .inTable('users')
            .onDelete('SET NULL');

        table.bigInteger('category_id')
            .unsigned()
            .nullable()
            .references('id')
            .inTable('categories')
            .onDelete('RESTRICT');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('reports', function (table) {
        table.dropForeign(['user_id']);
        table.dropForeign(['category_id']);
        table.dropColumn('user_id');
        table.dropColumn('category_id');
    });
};
