module Usability
  module UsersControllerPatch
    def self.included(base)
      base.send(:include, InstanceMethods)

      base.class_eval do
        if Redmine::Plugin.installed?(:ldap_users_sync)
          before_action :change_activity_options, only: [:show, :ld_user_details]
        else
          before_action :change_activity_options, only: [:show]
        end

        skip_before_action :require_admin, only: [:get_active_users]
      end

    end

    module InstanceMethods
      def change_activity_options
        if Journal.activity_provider_options['issues'].present? && Journal.activity_provider_options['issues'].has_key?(:scope)
          if Setting.plugin_usability['enable_full_activities_for_issues']
            Journal.activity_provider_options['issues'][:scope] = Journal.preload({ issue: :project }, :user).joins("LEFT OUTER JOIN #{JournalDetail.table_name} ON #{JournalDetail.table_name}.journal_id = #{Journal.table_name}.id").where("#{Journal.table_name}.journalized_type = 'Issue'")
            Journal.event_options[:type] = Proc.new { |o| o.notes.blank? ? ((s = o.new_status).present? && s.is_closed? ? 'issue-closed' : 'issue-edit') : 'issue-note' }
          else
            Journal.activity_provider_options['issues'][:scope] = Journal.preload({ issue: :project }, :user).joins("LEFT OUTER JOIN #{JournalDetail.table_name} ON #{JournalDetail.table_name}.journal_id = #{Journal.table_name}.id").where("#{Journal.table_name}.journalized_type = 'Issue' AND (#{JournalDetail.table_name}.prop_key = 'status_id' OR #{Journal.table_name}.notes <> '')")
            Journal.event_options[:type] = Proc.new { |o| (s = o.new_status) ? (s.is_closed? ? 'issue-closed' : 'issue-edit') : 'issue-note' }
          end
        end
      end

      def get_active_users
        render json: User.logged.active.visible.preload(:email_address).like(params[:name]).limit(10).map {|u| {text: u.name, id: u.id}}
      end
    end
  end
end
