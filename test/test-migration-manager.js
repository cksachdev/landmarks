'use strict'
const path = require('path')
const MigrationManager = require(
	path.join(__dirname, 'test-code-in-harness-migration-manager.js'))

exports['test the damage report machine'] = function(assert) {
	assert.ok(true, 'damage report machine intact')
}

exports['test one field-adding migration (implied v0)'] = function(assert) {
	const settings = {}
	const migrations = {
		1: function(settings) {
			settings['newSetting'] = true
		}
	}
	const migrationManager = new MigrationManager(migrations)
	migrationManager.migrate(settings)
	assert.strictEqual(settings.version, 1, 'bumped version')
	assert.strictEqual(settings.newSetting, true, 'added new setting')
}

exports['test removing a field (explicit version number)'] = function(assert) {
	const settings = {
		'version': 42,
		'deprecatedSetting': 'orange'
	}
	const migrations = {
		43: function(settings) {
			delete settings.deprecatedSetting
		}
	}
	const migrationManager = new MigrationManager(migrations)
	migrationManager.migrate(settings)
	assert.strictEqual(settings.version, 43, 'bumped version')
	assert.strictEqual(
		settings.hasOwnProperty('deprecatedSetting'), false, 'removed setting')
}

exports['test two migrations (explicit v0)'] = function(assert) {
	const settings = { 'version': 0 }
	const migrations = {
		1: function(settings) {
			settings['newSetting'] = true
		},
		2: function(settings) {
			settings['newNewSetting'] = true
		}
	}
	const migrationManager = new MigrationManager(migrations)
	migrationManager.migrate(settings)
	assert.strictEqual(settings.version, 2, 'got latest version')
	assert.strictEqual(settings.newSetting, true, 'added new setting')
	assert.strictEqual(settings.newNewSetting, true, 'added new new setting')
}

exports['test two migrations, only one needed, error path'] = function(assert) {
	// We're saying that we're starting with settings version 1, but we aren't.
	const settings = { 'version': 1 }
	const migrations = {
		1: function(settings) {
			settings['newSetting'] = true
		},
		2: function(settings) {
			settings['newNewSetting'] = true
		}
	}
	const migrationManager = new MigrationManager(migrations)
	migrationManager.migrate(settings)
	assert.strictEqual(settings.version, 2, 'got latest version')
	assert.strictEqual(settings.newSetting, undefined, "didn't run migration 1")
	assert.strictEqual(settings.newNewSetting, true, 'added new new setting')
}

exports['test returns false when migration not necessary'] = function(assert) {
	const settings = { version: 1 }
	const migrations = {
		1: function() {
			throw new Error('This should not be run')
		}
	}
	const migrationManager = new MigrationManager(migrations)
	const result = migrationManager.migrate(settings)
	assert.strictEqual(result, false, 'migration not needed')
}

exports['test returns true when migration is necessary'] = function(assert) {
	const settings = {}
	const migrations = {
		1: function() {}
	}
	const migrationManager = new MigrationManager(migrations)
	const result = migrationManager.migrate(settings)
	assert.strictEqual(result, true, 'migration was needed')
}

if (module === require.main) {
	require('test').run(exports)
}
