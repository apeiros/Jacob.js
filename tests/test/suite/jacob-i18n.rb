suite 'Jacob' :use => :js_baretest do
  suite 'I18n', :requires => 'jacob-i18n' do
    suite '#locale()' do
      setup %{
        I18n = new Jacob.I18n('generic');
      }
  
      execute %{
        I18n.locale();
      }
  
      verify.returns('generic')
    end
  end
end
