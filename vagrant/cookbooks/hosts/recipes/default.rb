execute "Change hostname" do
	command "echo 'badger.jakecallery.com' > /etc/hostname"
end

execute "run hostname" do
	command "hostname badger.jakecallery.com"
end

ruby_block "insert_line" do
  block do
    file = Chef::Util::FileEdit.new("/etc/hosts")
	  file.insert_line_if_no_match("127.0.0.1 badger.jakecallery.com", "127.0.0.1 badger.jakecallery.com")
    file.write_file
  end
end
