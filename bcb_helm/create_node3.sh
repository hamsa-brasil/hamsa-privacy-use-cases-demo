helm install node3-executor --namespace brldigital-t -f executor/values-node3-executor.yaml executor/
helm install node3-prover --namespace brldigital-t -f prover/values-node3-prover.yaml prover/
helm install node3-node --namespace brldigital-t -f node/values-node3-node.yaml node/



helm install node3-mongo --namespace brldigital-t -f mongodb/values-node3-mongodb.yaml mongodb/
helm install node3-postgre --namespace brldigital-t -f postgres/values-node3-postgresql.yaml postgres/