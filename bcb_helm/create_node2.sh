helm install node2-executor --namespace brldigital-t -f executor/values-node2-executor.yaml executor/
helm install node2-prover --namespace brldigital-t -f prover/values-node2-prover.yaml prover/
helm install node2-node --namespace brldigital-t -f node/values-node2-node.yaml node/


helm install node2-mongo --namespace brldigital-t -f mongodb/values-node2-mongodb.yaml mongodb/
helm install node2-postgre --namespace brldigital-t -f postgres/values-node2-postgresql.yaml postgres/