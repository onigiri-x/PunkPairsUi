export function getNickname(owner: string){
  let owners = getOwnersList();
  const nickname = owners.get(owner);
  if(nickname){
    return nickname;
  }
  return owner;
}


export function getOwnersList(): Map<string,string> {
  let owners = new Map<string, string>;
  owners.set('0xa858ddc0445d8131dac4d1de01f834ffcba52ef1', 'Yuga Labs');
  owners.set('0x26f744711ee9e5079cbeaf318ba8a8e938844de6', 'smithdavid888.eth');
  owners.set('0x577ebc5de943e35cdf9ecb5bbe1f7d7cb6c7c647', 'Mr 703');
  owners.set('0xcc7c335f3365ae3f7e4e8c9535dc92780a4add9d', 'Ape123');
  owners.set('0x6f4a2d3a4f47f9c647d86c929755593911ee91ec', 'Shaw');
  owners.set('0x6611fe71c233e4e7510b2795c242c9a57790b376', 'Moineau');
  owners.set('0xc480fb0ebea2591470f571436926785be5ebcd22', '3DG');
  owners.set('0x0258558bf2a4ffceec4a2311b36ef124d3a4116e', 'STRANGLEH0DL_VAULT');
  owners.set('0x06bf2b4da028b66fb08a75dd872acb9a483e5639', 'BBL');
  owners.set('0xf31f591b3dcd383047d7045de96a200a09e4dde1', 'Tomakinz');
  owners.set('0x0da0df4be467140e74c76257d002f52e954be4d3', 'Metakid');
  owners.set('0xb38071b23f0fa92cf9e1bd6feec5a5f9821f3ccc', 'Morfojin');
  owners.set('0x8b7a5b22175614ee194e9e02e9fe0a1b5414c75e', 'kryptos.eth');
  owners.set('0xd4fa6e82c77716fa1ef7f5defc5fd6eeefbd3bff', 'PrettyMerlot');
  owners.set('0x51ec89f1fcfed8c69a1b0865a7550ece0677cf5f', 'InSlothWeTrust');
  owners.set('0x6fb3ae4ecf5a42788249e95b931913a4fc3d488c', 'Spilliaer');
  owners.set('0xa6e2e910515e6cf485462eeb6e454df33c60cb0e', 'nakamotosatoshi.eth');
  owners.set('0x2b616914ada8484ab9d70398dbe86b029b1a9a39', 'kc');
  owners.set('0x6301add4fb128de9778b8651a2a9278b86761423', 'athrab.eth');
  owners.set('0x030defb961d3f3480a574cedf6ead227a7a8106b', 'superpleb.eth');
  owners.set('0xc24f574d6853f6f6a31c19d468a8c1b3f31c0e54', 'shilpixels.eth');
  owners.set('0x783ca9833d58a6b39ee72db81f07571d72c0064e', 'pjcurly.eth');
  owners.set('0x94de7e2c73529ebf3206aa3459e699fbcdfcd49b', 'tonyherrera.eth');
  owners.set('0x97ad156c48078cf174905ffb5cb7ca56295924b8', 'Tony Herrera Vault');
  owners.set('0xfaf9f63baf57b19ca4e9490aaab1ede8b66cc2b5', 'vr-punk.eth');
  owners.set('0x000001f568875f378bf6d170b790967fe429c81a', 'bokkypoobah.eth');
  owners.set('0xeb26e394da8d8ad5bedde97a281a9a9b63b3eef3', 'trademuch.eth');
  owners.set('0x00000217d2795f1da57e392d2a5bc87125baa38d', 'shittybank.eth');
  owners.set('0x8884f2af43bcbd9ab81f7a4ac35f421df1926810', 'alien3443.eth');
  owners.set('0x2be830c9c4a3eb3f9ebf736eed948e9ec1f1f33b', '3690.eth');
  owners.set('0xaf7cf5910510b7cf912c156f91244487632e5fb6', 'vault.seanbonner.eth');
  owners.set('0x2754637ab168ff25412b74997c0e4f43c30bb323', 'thecryptopunk.eth');
  owners.set('0xbde05e34ea7e059a56428985b66ae07fbc41a497', 'cyberpnk.eth');
  owners.set('0xe4bbcbff51e61d0d95fcc5016609ac8354b177c4', 'Steve Aoki');
  owners.set('0xfd845e07717b0329d3f19fc920c97fba0bc4ee31', 'j10.eth');
  owners.set('0x4a39ae58b605102913ac19b7c071da75b55b2674', 'punk7635.eth');
  owners.set('0x5bc02aab45797065768f68857b61e1dc60b26a89', 'omu.eth');
  owners.set('0x1e32a859d69dde58d03820f8f138c99b688d132f', 'straybits.eth');
  owners.set('0xc5d5560af8d0dcacaf8b8cee91911c4833c3f551', 'andrewii.eth');
  owners.set('0xb01e39a4965475047016544931f4b05b905b7059', 'punk4722.eth');
  owners.set('0xee075d16773517479f0ddba8cbc974ae4e1e205c', 'panksy.eth');
  owners.set('0x647eb74a5135a0f24beee3c2d8432adcbb32c2a8', 'iancr.eth');
  owners.set('0x457ec0c459f3ac559ceb48951675fbae4c744288', 'vault.robertclarke.eth');
  owners.set('0x7898fd5d80b52f6d8a9b7a8b908185536650f108', 'robertclarke.eth');
  owners.set('0x81b9a5f21efdb5df0210471b9a94e0d4ad9951ed', 'valko.eth');
  owners.set('0xfc9c09c6865a1459715ebe51df9a0e33a21a181a', 'PENN_PUNK');
  owners.set('0x000003e1e88a1110e961f135df8cdea4b1ffa81a', 'BokkyPooBah');
  owners.set('0x96ace5dc0404f2613ebcc5b04cd455b35b6bf7c7', 'DayJobPunks.eth');
  owners.set('0x1aeb8eb8f40beeccd58e9359a154309d7014a5e5', 'griffin.eth');

  return owners;
}

