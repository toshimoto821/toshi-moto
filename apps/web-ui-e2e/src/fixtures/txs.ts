type IGetTxsResponse = {
  address: string;
  sum?: number;
};
export const getTxsResponse = ({ address, sum }: IGetTxsResponse) => {
  // bc1qpc54dq6p0xfvy305hga42chpaa02tzj3ajtqel
  // const values = [
  //   7151915, 7650477, 7120403, 7093433, 7882298, 6796180, 7297140,
  // ];
  if (!sum) return [];
  // const total = values.reduce((acc, value) => acc + value, 0);
  return [
    {
      txid: "843adcef9e375cbd2f6266e1c582538d9017f675a32ccb394f24fac39edd4bcf",
      version: 2,
      locktime: 0,
      vin: [
        {
          txid: "130365511899de6702e14e0698dd637862e0d7b4003b1871411edaa8113e2e2a",
          vout: 6,
          prevout: {
            scriptpubkey: "00140c378d72d9e69fee77b60435582478971d116230",
            scriptpubkey_asm:
              "OP_0 OP_PUSHBYTES_20 0c378d72d9e69fee77b60435582478971d116230",
            scriptpubkey_type: "v0_p2wpkh",
            scriptpubkey_address: "bc1qpsmc6ukeu607uaakqs64sfrcjuw3zc3sjcj7th",
            value: 7151915,
          },
          scriptsig: "",
          scriptsig_asm: "",
          witness: [
            "3045022100f64ab65bc0c69072b10aa53ef633c356c81d3c9c7fed139ea2f68d86a3db27de02205408a1ab477eee7e9d253313c7ca3ee6cfecd8c91f1ff59e01cce60130ddaaf601",
            "03b7eff9298e2484effc0cfdc0653aa6a54d37b7eb763f8dee159d713525393e10",
          ],
          is_coinbase: false,
          sequence: 4294967295,
        },
        {
          txid: "151283c2af077073cea019429338a4f2ecbfe09e6d7540cf7c73d45e6a2c54ff",
          vout: 1,
          prevout: {
            scriptpubkey: "0014b466a7a43b25bef786c96518de65269e12751a08",
            scriptpubkey_asm:
              "OP_0 OP_PUSHBYTES_20 b466a7a43b25bef786c96518de65269e12751a08",
            scriptpubkey_type: "v0_p2wpkh",
            scriptpubkey_address: "bc1qk3n20fpmykl00pkfv5vduefxncf82xsgkrnykn",
            value: 7650477,
          },
          scriptsig: "",
          scriptsig_asm: "",
          witness: [
            "304502210099bbe6a3d76afe26ebcd1a4721321887f1699de3e12b436be854cd6251b6602402202c18510a0cf0a3e76c0829dd61be259a9b9d72fd8ab15fb13629c19c4d41040f01",
            "03b5f461f86ce03f04459dc11bae3531351ad9d12c2ed7de889697520f32b97728",
          ],
          is_coinbase: false,
          sequence: 4294967295,
        },
        {
          txid: "1bb4827184c5e95003d9c495da47be33c413a9aedbf7cb915414815b4447f352",
          vout: 4,
          prevout: {
            scriptpubkey: "0014f57e47e9a68df58e01cc5b14225a70c90bc853ae",
            scriptpubkey_asm:
              "OP_0 OP_PUSHBYTES_20 f57e47e9a68df58e01cc5b14225a70c90bc853ae",
            scriptpubkey_type: "v0_p2wpkh",
            scriptpubkey_address: "bc1q74ly06dx3h6cuqwvtv2zyknsey9us5aw0smjzc",
            value: 7120403,
          },
          scriptsig: "",
          scriptsig_asm: "",
          witness: [
            "304502210083e645bf0ef7cc06e081d1a463aeccb8df35e8822db77368f769930d4e33534a022003fdab2b3a4dca3f554de7cdc7965308841d074fc0cb54419b5d5b1060836b9c01",
            "03e1e492801d367e8ade6511f7b71ca1bf7a72b0bf4e7eed9eeb53fe41a29a9901",
          ],
          is_coinbase: false,
          sequence: 4294967295,
        },
        {
          txid: "204771e8c9b4a00dcbc6cd04bd5187efa3b857bb25058ca14799934b42bb2fc2",
          vout: 1,
          prevout: {
            scriptpubkey: "00146cc47b23eb08ba6085205ec9f7277fe8369df740",
            scriptpubkey_asm:
              "OP_0 OP_PUSHBYTES_20 6cc47b23eb08ba6085205ec9f7277fe8369df740",
            scriptpubkey_type: "v0_p2wpkh",
            scriptpubkey_address: "bc1qdnz8kgltpzaxppfqtmylwfmlaqmfma6qyrfrcu",
            value: 7093433,
          },
          scriptsig: "",
          scriptsig_asm: "",
          witness: [
            "30450221009f280f5343f6a4464d90d31efc256573aa9adf410418577004947bee49e855c302200321b822a04975693a2bcfd6eff57482c343023cebcdadeed606d23233b676e801",
            "0328924bc7d78b5a8a1f1b6315187aedafa7c709f9189f41f950c7ebf20325f99d",
          ],
          is_coinbase: false,
          sequence: 4294967295,
        },
        {
          txid: "63f39f2f73318e58644969be1b5016abece409f7be11497d38eba7935cdc0291",
          vout: 5,
          prevout: {
            scriptpubkey: "001429bb4d74b540715a3d40144015ed5183ef88f954",
            scriptpubkey_asm:
              "OP_0 OP_PUSHBYTES_20 29bb4d74b540715a3d40144015ed5183ef88f954",
            scriptpubkey_type: "v0_p2wpkh",
            scriptpubkey_address: "bc1q9xa56a94gpc4502qz3qptm23s0hc3725aw5uds",
            value: 7882298,
          },
          scriptsig: "",
          scriptsig_asm: "",
          witness: [
            "304402201b2077cb25894e1f8af1280b962df5e964db1e8d728d81b96cb0cf85c9487b3602206a92a4e71d862072cf3d87d1578bc78d4e3447fdcbc5b5cf85adcc33aa25a74301",
            "038c9055362b9b99b50893513c8c8c720215173abc1c9435ac5bed77adff3b3250",
          ],
          is_coinbase: false,
          sequence: 4294967295,
        },
        {
          txid: "c5b31bc08c0fc29ff38175f399876af1b67a10277f1c230f6ef435009dad5cc3",
          vout: 1,
          prevout: {
            scriptpubkey: "001474eb74605385b7c338d74c3057a0d2b37fe01c3a",
            scriptpubkey_asm:
              "OP_0 OP_PUSHBYTES_20 74eb74605385b7c338d74c3057a0d2b37fe01c3a",
            scriptpubkey_type: "v0_p2wpkh",
            scriptpubkey_address: "bc1qwn4hgcznskmuxwxhfsc90gxjkdl7q8p6fuxcv0",
            value: 6796180,
          },
          scriptsig: "",
          scriptsig_asm: "",
          witness: [
            "304502210084de3280090a62b5a14bdef367d38510be14798d21267bba5d533efb69efdc8602206bc135d725fd3ce63d67e4bb3973e1a665ec2e6d2b4ac026fc029f474faf495801",
            "03f7879640a98f994fdd8594d5d5f159870c12539e2e824c2217ffb7d8e9570c01",
          ],
          is_coinbase: false,
          sequence: 4294967295,
        },
        {
          txid: "d07bc73e318ff0b10a745c103b528c7f7e74999bd7b6791654668c48bbb00e48",
          vout: 0,
          prevout: {
            scriptpubkey: "0014781350c55f896ab8a1367bd08b342c7a239b2316",
            scriptpubkey_asm:
              "OP_0 OP_PUSHBYTES_20 781350c55f896ab8a1367bd08b342c7a239b2316",
            scriptpubkey_type: "v0_p2wpkh",
            scriptpubkey_address: "bc1q0qf4p32l394t3gfk00ggkdpv0g3ekgckn3xe32",
            value: 7297140,
          },
          scriptsig: "",
          scriptsig_asm: "",
          witness: [
            "3045022100e19eaa96085a1d48177b615b9c2c382fa2bf50fb721c77d0fef2623c3a889b50022071850169cf5289e43e0265206082c89266808a630b9f834deee9177d3388ca1501",
            "02625e83ad8250aaec48c7f639c3ed190bbe3a41e717841a425e4cc88c6ca7d2ff",
          ],
          is_coinbase: false,
          sequence: 4294967295,
        },
      ],
      vout: [
        {
          scriptpubkey: "00140e295683417992c245f4ba3b5562e1ef5ea58a51",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 0e295683417992c245f4ba3b5562e1ef5ea58a51",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: address,
          value: sum,
        },
        {
          scriptpubkey: "0014dcc95fe1e1999bef45e514b3189176c545b3e51f",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 dcc95fe1e1999bef45e514b3189176c545b3e51f",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qmny4lc0pnxd77309zje33ytkc4zm8eglswj2j2",
          value: 86490,
        },
        {
          scriptpubkey: "00141d618ff1acd4cfd0d7ed6c04939305ca6729c82c",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 1d618ff1acd4cfd0d7ed6c04939305ca6729c82c",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qr4scludv6n8ap4lddszf8yc9efnjnjpvmalwqw",
          value: 100000,
        },
        {
          scriptpubkey: "00145397d11919d853962fb8955ec0ef79588ee3d1f5",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 5397d11919d853962fb8955ec0ef79588ee3d1f5",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1q2wtazxgempfevtacj40vpmmetz8w8504shtaqm",
          value: 200000,
        },
        {
          scriptpubkey: "a91426f3555bb0aa7e5a9751d13f45e1beff40b454af87",
          scriptpubkey_asm:
            "OP_HASH160 OP_PUSHBYTES_20 26f3555bb0aa7e5a9751d13f45e1beff40b454af OP_EQUAL",
          scriptpubkey_type: "p2sh",
          scriptpubkey_address: "35Ey6wGUPWQHhgPSjHvAzTyVpYKJgidUuj",
          value: 213566,
        },
        {
          scriptpubkey: "0014406d75eacba291b4a4872db8f928476c62d3aada",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 406d75eacba291b4a4872db8f928476c62d3aada",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qgpkht6kt52gmffy89ku0j2z8d33d82k6upmpm9",
          value: 246455,
        },
        {
          scriptpubkey: "001462ce9a7b30f2e5d7c8673443860ca5cbb842484d",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 62ce9a7b30f2e5d7c8673443860ca5cbb842484d",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qvt8f57es7tja0jr8x3pcvr99ewuyyjzdxht0y9",
          value: 341532,
        },
        {
          scriptpubkey: "001477c11f0c184afcf3ce21c2aebce184fe235bfa59",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 77c11f0c184afcf3ce21c2aebce184fe235bfa59",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qwlq37rqcft708n3pc2htecvylc34h7jesapk0w",
          value: 518873,
        },
        {
          scriptpubkey: "76a9145572996312d21cc2e572da04a82b27b4378a88b588ac",
          scriptpubkey_asm:
            "OP_DUP OP_HASH160 OP_PUSHBYTES_20 5572996312d21cc2e572da04a82b27b4378a88b5 OP_EQUALVERIFY OP_CHECKSIG",
          scriptpubkey_type: "p2pkh",
          scriptpubkey_address: "18noio8d9ZhiKxnLudSXuPjPzFfYLHtdrY",
          value: 632500,
        },
        {
          scriptpubkey: "00148aba78aae7ded7e858574c33764d77bd4cfa2309",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 8aba78aae7ded7e858574c33764d77bd4cfa2309",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1q32a832h8mmt7skzhfsehvnthh4x05gcfkrtygg",
          value: 751563,
        },
        {
          scriptpubkey: "0014b41f86fec51bf5a81f7593e5092898da1f0e7411",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 b41f86fec51bf5a81f7593e5092898da1f0e7411",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qks0cdlk9r066s8m4j0jsj2ycmg0suaq3gj772q",
          value: 947598,
        },
        {
          scriptpubkey: "0014b918ca6b063765ca29b032871590441df10fcf77",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 b918ca6b063765ca29b032871590441df10fcf77",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qhyvv56cxxaju52dsx2r3tyzyrhcslnmhzhewuv",
          value: 1069420,
        },
        {
          scriptpubkey: "a91490333ef5306fa4ad98182664d730cc2807b3a55887",
          scriptpubkey_asm:
            "OP_HASH160 OP_PUSHBYTES_20 90333ef5306fa4ad98182664d730cc2807b3a558 OP_EQUAL",
          scriptpubkey_type: "p2sh",
          scriptpubkey_address: "3EqUcoAzBxgGjq6y7Jk1Qs7HStkaSyjhhr",
          value: 1191649,
        },
        {
          scriptpubkey: "0014987ff1f937eacf9490317b4c2a223abafbc12ab7",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 987ff1f937eacf9490317b4c2a223abafbc12ab7",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qnpllr7fhat8efyp30dxz5g36htauz24hypee95",
          value: 1973944,
        },
        {
          scriptpubkey: "00149afffefe3157e9c489fe958be4dd5060b7a8bbe2",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 9afffefe3157e9c489fe958be4dd5060b7a8bbe2",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qntllal332l5ufz07jk97fh2svzm63wlz7dcxj9",
          value: 1996725,
        },
        {
          scriptpubkey: "0014039800eb2ce6496d4a2a35d121b8e6a4d9b516fe",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 039800eb2ce6496d4a2a35d121b8e6a4d9b516fe",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qqwvqp6evueyk6j32xhgjrw8x5nvm29h7ld77d0",
          value: 2019852,
        },
        {
          scriptpubkey: "0014bf29b4fc7d82cccaec57fb7ff0f03640a91be07f",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 bf29b4fc7d82cccaec57fb7ff0f03640a91be07f",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qhu5mflrastxv4mzhldllpupkgz53hcrlyekp83",
          value: 2066011,
        },
        {
          scriptpubkey: "0014bff20fc7a44ed30a42f61e7910ff7a6c3755102d",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 bff20fc7a44ed30a42f61e7910ff7a6c3755102d",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qhleql3ayfmfs5shkreu3plm6dsm42ypda4q4cz",
          value: 3117890,
        },
        {
          scriptpubkey: "0014708b2108698704e5b4fb0c111c3435decab85cb7",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 708b2108698704e5b4fb0c111c3435decab85cb7",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qwz9jzzrfsuzwtd8mpsg3cdp4mm9tsh9hnktf0n",
          value: 7823371,
        },
        {
          scriptpubkey: "0014c54fcb9ce775162ede302922b768fb22f31c0840",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 c54fcb9ce775162ede302922b768fb22f31c0840",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1qc48uh888w5tzah3s9y3tw68myte3czzqmg50dh",
          value: 10000000,
        },
        {
          scriptpubkey: "0014a2cdad0502b07b62a07adaea0072b2b52205c0da",
          scriptpubkey_asm:
            "OP_0 OP_PUSHBYTES_20 a2cdad0502b07b62a07adaea0072b2b52205c0da",
          scriptpubkey_type: "v0_p2wpkh",
          scriptpubkey_address: "bc1q5tx66pgzkpak9gr6mt4qqu4jk53qtsx6vxtwue",
          value: 15620287,
        },
      ],
      size: 1710,
      weight: 4569,
      sigops: 11,
      fee: 64120,
      status: {
        confirmed: true,
        block_height: 833109,
        block_hash:
          "00000000000000000000b035d517f0d32e59a34af821eeb2244d16a087f7d92c",
        block_time: 1709558315,
      },
    },
  ];
};
