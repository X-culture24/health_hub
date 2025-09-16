#!/bin/bash

# Jenkins Setup Script for Kenya Health System
# This script configures Jenkins with necessary plugins and jobs

set -e

echo "Setting up Jenkins for Kenya Health System CI/CD..."

# Wait for Jenkins to be ready
echo "Waiting for Jenkins to start..."
until curl -s http://localhost:8080/login >/dev/null; do
    sleep 5
done

# Get initial admin password
JENKINS_PASSWORD=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)
echo "Jenkins initial admin password: $JENKINS_PASSWORD"

# Install Jenkins CLI
wget -q http://localhost:8080/jnlpJars/jenkins-cli.jar

# Function to run Jenkins CLI commands
jenkins_cli() {
    java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$JENKINS_PASSWORD "$@"
}

# Install required plugins
echo "Installing Jenkins plugins..."
jenkins_cli install-plugin \
    git \
    docker-workflow \
    pipeline-stage-view \
    build-timeout \
    credentials-binding \
    timestamper \
    ws-cleanup \
    ant \
    gradle \
    workflow-aggregator \
    github-branch-source \
    pipeline-github-lib \
    pipeline-stage-view \
    ssh-slaves \
    matrix-auth \
    pam-auth \
    ldap \
    email-ext \
    mailer

# Restart Jenkins to load plugins
echo "Restarting Jenkins to load plugins..."
jenkins_cli restart
sleep 30

# Wait for Jenkins to be ready again
until curl -s http://localhost:8080/login >/dev/null; do
    sleep 5
done

# Create a job for the Kenya Health System
echo "Creating Jenkins job..."
cat > kenya-health-system-job.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <actions/>
  <description>CI/CD Pipeline for Kenya Health System</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers>
        <hudson.triggers.SCMTrigger>
          <spec>H/5 * * * *</spec>
          <ignorePostCommitHooks>false</ignorePostCommitHooks>
        </hudson.triggers.SCMTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.87">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.7.1">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>/home/vagrant/kenya_health_system</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF

# Create the job
jenkins_cli create-job "Kenya-Health-System" < kenya-health-system-job.xml

# Configure global settings
echo "Configuring Jenkins global settings..."
cat > jenkins-config.groovy << 'EOF'
import jenkins.model.*
import hudson.security.*
import hudson.security.csrf.DefaultCrumbIssuer
import jenkins.security.s2m.AdminWhitelistRule

def instance = Jenkins.getInstance()

// Enable CSRF protection
instance.setCrumbIssuer(new DefaultCrumbIssuer(true))

// Configure security
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount("admin", "admin123")
instance.setSecurityRealm(hudsonRealm)

def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
strategy.setAllowAnonymousRead(false)
instance.setAuthorizationStrategy(strategy)

// Save configuration
instance.save()

println "Jenkins configured successfully!"
EOF

# Apply configuration
jenkins_cli groovy = < jenkins-config.groovy

echo "Jenkins setup completed!"
echo "Access Jenkins at: http://localhost:9004"
echo "Default credentials: admin/admin123"
echo "Initial admin password was: $JENKINS_PASSWORD"

# Clean up
rm -f jenkins-cli.jar kenya-health-system-job.xml jenkins-config.groovy
