class CreatePets < ActiveRecord::Migration[8.1]
  def change
    create_table :pets do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name,    null: false
      t.string :species, null: false
      t.string :breed
      t.string :color
      t.text   :description

      t.timestamps
    end
  end
end
