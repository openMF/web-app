pipeline {

    agent any
    environment {
           APP_NAME = "mifos-uo"
           IMAGE_BASE_NAME = "${CI_REGISTRY}/${APP_NAME}"           
    }

    stages {
        
        stage('Docker Build & Push Image') {
            when {
                anyOf {
                    branch "master";
                }
            }

            steps {
              script {  
                 sh '''
                    IMAGE_TAG="prod_$(date +%Y-%m-%d-%H-%M)"
                    IMAGE_NAME="${IMAGE_BASE_NAME}:${IMAGE_TAG}"
                    docker build  -f Dockerfile -t $IMAGE_NAME .
                    docker push $IMAGE_NAME
                '''
              }
            }
        }
    }
}
