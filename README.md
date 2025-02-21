<div style="text-align:center">

![Hamsa Privacy built on Microsoft Zero-Knowledge Proof System (ZK-Rollup)](https://cdn.prod.website-files.com/641232f06fb3a3527f6bc1cc/6732599bda190998d43bd209_Vectors-Wrapper.svg)

</div>

---
<p style="text-align:right"><small ><i>Installation Manual | Image v0.0.5</i></small></p>

## What's the ZK-Rollup?

The ZK-Rollup solution was specifically designed for the Drex platform in Brazil. The solution offers advanced data protection and regulatory compliance for financial institutions seeking to ensure the privacy and security of digital transactions. Consortium members can use zero-knowledge-proof capabilities to validate transactions without revealing confidential information.

## Main Features of Zk-Rollup

-   **Zero-Knowledge Proof Technology:** Zero-Knowledge Proof Technology: Secures transactions with zero-knowledge proofs, protecting sensitive data.
-   **Conformidade Regulamentar:** Meets local and global standards for compliance.
-   **Drex Platform Integration:**  Seamlessly integrates with the Central Bank of Brazil's tokenization and transaction framework.



# Demo environment setup and ZK-Rollup pre-configuration

<table data-number-column="false" data-layout="default" data-autosize="false" data-table-local-id="e7edacb4-97d9-49de-8000-c85f73e8f9c5" data-table-width="100%"><colgroup><col></colgroup><tbody><tr data-prosemirror-content-type="node" data-prosemirror-node-name="tableRow" data-prosemirror-node-block="true"><td style="background-color: #f3f8fc;" data-cell-background="#f3f8fc" class="pm-table-cell-content-wrap" data-prosemirror-content-type="node" data-prosemirror-node-name="tableCell" data-prosemirror-node-block="true"><p data-prosemirror-content-type="node" data-prosemirror-node-name="paragraph" data-prosemirror-node-block="true"><strong data-prosemirror-content-type="mark" data-prosemirror-mark-name="strong">CAUTION: </strong>NodeJs 18+ is required to proceed next steps</p></td></tr></tbody></table>

1.  Clone this repository and access the folder:
2.  Install npm dependencies:

```
npm i
```

### Smart contract compilation and deployment of DVP-Match and Rollup on Layer 1

Both at the non-internet and with an internet connection and using the text editor available, follow the steps below:

1.  Open the _hardhat.config.js_ file in your preferred editor and update the Hyperledger Besu address:
2.  server\_L1\_besu: <IP or URI do Hyperledger Besu (Layer 1)>:<PORT>

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXcrL9cefAgOlfGWaUkgSN0_afC4lm2CUaG1s52yVVB3M6yJHK14jesH3KwCLrft8ZgNBun3wYbBauBY4reBDOyYT_p4o9KSivXPi4gmGk2GNzqUOPrVWeDl-ShsR5ccVBTYE7Ss6g?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")

3.  Compile smart contracts:

```
npx hardhat compile
```

### Deploying DVP-Match on Hyperledger Besu

1.  To deploy DVP-Match, run the following command:

```
npm run deploy-dvp-match-server-L1
```

The expected output will be similar to the following:

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXfjue-GDofleWDU53jMB91t0M8hmFBZ5LtsylRh5wi559HlTyiFs2SSocl6tCSoYxQNgByxGYCpRw_ntZWlN_2GCXAI0mQ3dEmECNNz3LzkQDsY6GX3w4XkmN8aMqJR3TNwhJid5g?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")

2.  Copy and store this value to use in the [node deployment process](https://github.com/hamsa-brasil/hamsa-privacy-helm-installation).

### Rollup Verifier Deployment on Hyperledger Besu

1.  To deploy the Rollup verifier, execute the command below:

```
npm run deploy-rollup-server-L1
```

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdJ_mf_B0nD8wis3RY-dwDj31TVf74RTYq1UOvS73u2L6ehUfMC6XZ5tbaWtmpEE-JCEMZZ75IJwizynsBFI7AD_CblyHofiwULKquyk16ivpHKGbn7FtkWpVZiS88llwEMPo02?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")

2.  Copy and store this value to use in the [node deployment process](https://github.com/hamsa-brasil/hamsa-privacy-helm-installation).


# Running the Use Cases

## Setting up the demo environment

Regarding that, there are two modes for running the use case scripts. In both modes, the use case scripts are the same.

Minimal requirements:

-   NodeJS 18+
-   Internet communication
-   Non-blocked npm registry

On the _demo files (downloaded from_ [_public demo use case scripts repository_](https://github.com/hamsa-brasil/hamsa-privacy-use-cases-demo)_)_ folder, you should [change some values](#Updating-the-hardhat.config.js-file) using your preferred text code editor.

### Updating the hardhat.config.js file

Update the _hardhat.config.js_ with each node service URI address for each _server\_L2\_<NODE NUMBER>_ in the networks property, ex.: _server\_L2\_1_, _server\_L2\_2_, etc.

_**Repeat this step to each node.**_

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXcUu4yHYmqzQ4J6xrQqYF2tGFmNfyUUZehSJ-XZxnSOxIzcFaTR2qthK0YHQQRdTwgqKevxZ54jXYrvkjCfAHPiVe-X1Ei3jY5wGSHLlEDMoZ1mzqJ6wvucadXVLn0jjED-dMAIjw?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")

## Installing all Central Bank smart contracts

Run this command:

```
npm run drex-deploy-contracts-L1
```

Copy the selected value below and store it for use in the next steps.

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXfkuygvZslRPb7J7R3_LjR2itypXu_eu_rn3NKSzmIYfE8vkrMG1lZHzdRQg-1jOSE15g9nY2R1flb5w_XCqtWbbwubdTWNsTw4Rw3Rp_pzsDSsp1V8wgf4I8Khd6Fb88fGRuFamQ?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")

## Wholesale TPFt workflow (DvP)

Run the command below:

```
npm run drex-wholesale
```

Paste the copied [Address Discovery](#Copy-the-Address-Discovery) value on the prompt:

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXeKpBa-g9Hv6dbTvofJdqhvtKQfja591KC9lV2OWVi1GxQ81V_vi9apWqCyOJAED4_3sbr1xY33HHlEHVncv6aaejMqOCfwFtNpVCZLpCEGhZTIADDhCbEkNmA6It8y3R1HN_A1XQ?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")

The expected output for this script is as below:

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXe-reHpiaOFT5qvprwLjWiGZXwIrXXSDl7ZjaOvMGBMxodXCsELgwS4OJ2lO5A80xBU1PzKK5PrHJm3qKTkmVpQJcojrfE9H6riW1L4uODfGLnxhI8LxKjcM33pxVWOf8WMXXdDZQ?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdsOAS5bIz_idPv05NulfeAM7ZM8YZe5C81V38BUbWQsrm_6L9tPagKRve33sYwcLADekDKhY9XJaJt65fTj2it3ISHj6Kh9fpqc7yC1Az83VqZy6iwW7vTNoH3Cr4BQUoFsjcG4A?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")

## Retail TPFt purchase workflow (DvP)

Run the command below:

```
npm run drex-retail
```

Paste the copied [Address Discovery](#Copy-the-Address-Discovery) value on the prompt:

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXeHkH5rDSxJ-55nICdZh9Q7hqbBjc8Y7IAZ9kVvkDaj3hqZVC2JN3R0TPW8HtJ9sUbbw_u3-nltnb5rKcrqne2xjhDZ-ZbLx8JN6GwpMResncfWoH-QVFdKSL4bZqr42V33dnqczw?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")

The expected output for this script is as below:

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXcFK6VaKZg8uGT3r7ggyWHzNZuD2IU3Y5C4keSNqrUWrs6D6nU3wZIepViZ1zTxS5H7xypuFfJM6FDQ_a2IDYngVOHjRkUQLmUqPJDUBHLwUSKS0HGxH3em7KlRaQ6TTsO-OPuP?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXe5Avsn3aUAdDRY3b8qY5y3ZteC58ioRg2hnPr0Ozz4nNbvEFFRTUKHs8YGg9kkKWJaAvasxI2noFAIqTqHgH28CeQDH0wDFWcWCYlXzpXPBxvjEqImh3JEGtJgH-ivAmApz1cM-g?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")

## Internal retail transfer RT <-> RT (the same bank and same rollup node)

Run the following command:

```
npm run drex-internal-bank-tx
```

Paste the copied [Address Discovery](#Copy-the-Address-Discovery) value on the prompt:

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXf_B3COsD1-9fxuJqnfVybbR95mwrldW1TXqEkIPR3nyOpGqEl8EW1gnNtC43WumyhG-N5LYlY1eEJ250Gx0kJd6aHdJ0kcHJ086uCA3ocGs1mq0tDCvQP0bBEqD8eMfBBLwbkU?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")

The expected output for this script is as below:

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXf2w45jU1o94uMRRKs_MMH3UAhqxRrw2VKpwOCpdWkS0U0EnYXaUemF6gUoYUiVmdXvPaEJJKQWxXtkTPUxh5j3Wf8klOiIXlbu9GKsLTTKKGNvrhgCGvyl8tKv-tUZ7JS5aMUXUw?key=24MlvQebBABlxhcoWBgzXB7C "Attachment")
