match '404', to: 'us_errors#error_404', via: [:get]
match '500', to: 'us_errors#error_500', via: [:get]

get 'attachments/download/all/:id', controller: :attachments, action: :download_all

post '/projects/:project_id/change_project_memberships_us', controller: :members, action: :change_project_memberships_us
get 'get_active_users', controller: :users, action: :get_active_users
get 'projects/:id/not_member_principal', controller: :projects, action: :not_member_principal