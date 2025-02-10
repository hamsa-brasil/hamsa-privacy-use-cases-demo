
helm install node4-executor --namespace brldigital-t -f executor/values-node4-executor.yaml executor/
helm install node4-prover --namespace brldigital-t -f prover/values-node4-prover.yaml prover/
helm install node4-node --namespace brldigital-t -f node/values-node4-node.yaml node/


helm install node4-mongo --namespace brldigital-t -f mongodb/values-node4-mongodb.yaml mongodb/
helm install node4-postgre --namespace brldigital-t -f postgres/values-node4-postgresql.yaml postgres/