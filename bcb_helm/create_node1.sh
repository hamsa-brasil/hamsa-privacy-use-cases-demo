helm install node1-executor --namespace brldigital-t -f executor/values-node1-executor.yaml executor/
helm install node1-prover --namespace brldigital-t -f prover/values-node1-prover.yaml prover/
helm install node1-node --namespace brldigital-t -f node/values-node1-node.yaml node/
helm install node1-mongo --namespace brldigital-t -f mongodb/values-node1-mongodb.yaml mongodb/
helm install node1-postgre --namespace brldigital-t -f postgres/values-node1-postgresql.yaml postgres/