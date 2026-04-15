class CreateSightings < ActiveRecord::Migration[8.1]
  def change
    create_table :sightings do |t|
      t.references :announcement, null: false, foreign_key: true
      t.references :user, foreign_key: true  # nullable — anônimos não precisam de conta
      t.string   :reporter_name
      t.string   :reporter_phone
      t.boolean  :saw_it,  null: false, default: true
      t.column   :location, :geography, geographic: true, srid: 4326, limit: { type: "Point" }
      t.string   :address
      t.text     :description
      t.datetime :seen_at

      t.timestamps
    end

    add_index :sightings, :location, using: :gist
  end
end
