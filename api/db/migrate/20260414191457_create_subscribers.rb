class CreateSubscribers < ActiveRecord::Migration[8.1]
  def change
    create_table :subscribers do |t|
      t.string  :phone, null: false
      t.string  :name,  null: false
      t.string  :address
      t.decimal :lat, precision: 10, scale: 7
      t.decimal :lng, precision: 10, scale: 7
      t.integer :notification_radius_km, null: false, default: 5

      t.timestamps
    end

    add_index :subscribers, :phone, unique: true
  end
end
