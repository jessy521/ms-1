pipeline {

    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'cd  /hotel-management-system-be'
                sh 'npm install'
                sh 'npm run build'
            }
        }
    }
}
