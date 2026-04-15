class EnablePostgis < ActiveRecord::Migration[8.1]
  def up
    enable_extension "postgis" unless extension_enabled?("postgis")
  end

  def down
    # Do not disable postgis as other extensions may depend on it
  end
end
