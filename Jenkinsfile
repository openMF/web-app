pipeline {

    agent any
    parameters {
        string(name: 'ENV_TAG', defaultValue: 'dev')
    }
    environment {
           APP_NAME = "mifos-ui"
           IMAGE_BASE_NAME = "${CI_REGISTRY}/${APP_NAME}"           
    }

    stages {
        
        stage('Docker Build & Push Image') {
            steps {
              script {

                if(env.BRANCH_NAME == "master"){
                    env.ENV_TAG = "prod"
                }
                if(env.BRANCH_NAME == "dev") {
                    env.ENV_TAG = "dev"
                }

                 sh '''fl
                    IMAGE_TAG="${ENV_TAG}_$(date +%Y-%m-%d-%H-%M)"
                    IMAGE_NAME="${IMAGE_BASE_NAME}:${IMAGE_TAG}"
                    docker build  -f Dockerfile -t $IMAGE_NAME .
                    docker push $IMAGE_NAME
                '''
              }
            }
        }
    }
}
