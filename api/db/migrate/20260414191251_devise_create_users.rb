# frozen_string_literal: true

class DeviseCreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :phone, null: false, default: ""
      t.string :name
      t.string :encrypted_password, null: false, default: ""

      # JWT token revocation
      t.string :jti, null: false

      t.timestamps null: false
    end

    add_index :users, :phone, unique: true
    add_index :users, :jti, unique: true
  end
end
