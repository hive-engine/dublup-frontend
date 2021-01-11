<template>
  <div class="faq">
    <h2 class="mb-5">
      Frequently Asked Questions
    </h2>

    <b-card v-for="(faq,i) of faqs" :key="i" header-class="h6" class="mt-3" :header="faq.question">
      <div class="faq-answer" v-html="faq.answer" />
    </b-card>
  </div>
</template>

<script>
export default {
  name: 'FAQ',

  data () {
    return {
      faqs: [{
        question: 'What is DUBLUP?',
        answer: '<p>DUBLUP is a fun, community led prediction market built on the HIVE blockchain that allows users to gamify the PAL token that was airdropped to HIVE stakeholders over the last two years. All markets are verified by a trusted group of Oracles that have opted in from PAL stakeholders.</p>'
      }, {
        question: 'What is a Prediction Market?',
        answer: '<p>A prediction market is a way for people to speculate on future events with other interested parties that may agree or disagree with them. In the case of DUBLUP, users are backing up their predictions and playing against each other for PAL.</p>'
      }, {
        question: 'How Do Markets Work?',
        answer: '<p>Users will pay a market creation fee in PAL and design a market from one of the site’s templates or by using the custom market creation tool. The market maker must define a duration that the primary market is available for users to buy shares of the market as well as the duration of the event the market is being created to predict. After the primary market period ends, the event will be considered live. While the event is live, users may buy and sell their shares to other users on the secondary market.</p><p>Once the event is finished, Oracles will validate the outcome of the market and 95% of the PAL market is distributed to the accounts holding winning shares, 4% of the PAL is distributed among the Oracles that validated the market, and 1% is distributed to the market creator.</p>'
      }, {
        question: 'What is PAL?',
        answer: '<p>PAL is a community token that was initially distributed to the Peace, Abundance, and Liberty community freely over the last two years. Several waves of airdrop distribution have occurred to further decentralize the token since then. Members continue to earn PAL through post rewards in the palnet community on the Hive blockchain. PAL is traded on Hive-Engine.</p>'
      }, {
        question: 'How Do I Create a Market?',
        answer: '<p>To create a market, first log in with your HIVE account and make sure that you have enough PAL in your wallet to cover the market creation fee. Once you are logged in, click the create button on the top bar of the site. There are many market templates to pick from including price speculation (cryptocurrencies, stocks, and markets), sporting events, political events, and even movie releases and social media. If you don’t see a template that is right for you, you can create a custom market with the custom market creation tool. Whether you create a custom market or use one of our templates, it is important to create a valid market.</p><p>For a market to be valid, the primary market must close before the event begins. For example, if your market is about a football game, the primary market needs to close on or before the game’s start time. Markets must also not ask vague or subjective questions where the oracles can’t make a decision based on publicly available data from independent third-party sources. We’ll get more into Invalid Markets and what happens with them below.</p>'
      }, {
        question: 'Are There Any Market Restrictions?',
        answer: '<p>Yes, as mentioned above markets do have some general guidelines to protect market integrity. In addition to the general guidelines for creating a valid market, users are not allowed to make death markets (whether or not a person will die on a specific day) or any market based on someone doing illegal or harmful acts to others’ person or property.</p>'
      }, {
        question: 'What is an Invalid Market?',
        answer: '<p>An Invalid Market is any market where the outcome is either known before the primary market closes or the resolution to the market is vague or subjective. If the data cannot be verified conclusively by independent third party sources, the market will be resolved as invalid.</p><p>In the event that a Market resolves as Invalid, all shares of the Invalid Market are refunded in their entirety. The market creation fee will not be refunded and it is the responsibility of the user creating the market to ensure their market is Valid when creating it. If you need help creating a valid market or have any questions, feel free to join the Discord server and ask the community leaders for guidance before creating a market.</p>'
      }, {
        question: 'How Do I Participate in a Market?',
        answer: '<p>Users can participate in a market during the Primary Market phase by buying shares with PAL. A user chooses a market outcome they believe to be correct, the number of shares they want to purchase, and the clicks the “Buy Shares” button on the market page.</p><p>Once the Primary Market phase is closed, the Secondary Market phase opens. During the Secondary Market phase, a user can buy shares from or sell shares to other users on the secondary market. The secondary market can be found underneath the Primary Market section on the market page.</p>'
      }, {
        question: 'How Does the Oracle System Work?',
        answer: '<p>Oracles have a critically important role to play and are rewarded for accurately reporting the outcome of events. In turn, Oracles can also lose their Oracle status for reporting outcomes incorrectly. Due to the importance of the Oracle System, it is an opt-in only system for PAL stakeholders that have a minimum of 10,000 PAL staked.</p><p>Each oracle is a member of the oracle pool. When a market finishes, twenty oracles are chosen from the pool to resolve the market. While oracles are chosen randomly from the pool, the chance of being chosen is influenced by stake weight and reputation. This is necessary to strenghten the oracle system and remove the incentive to create multiple oracles and game the system.</p><p>Oracles gain reputation for accurately reporting events in concensus with the other oracles and lose reputation for reporting out of concensus with the other oracles. Oracles who vote in consensus share the 4% oracle fees equally.</p>'
      }, {
        question: 'How Do I Become an Oracle?',
        answer: '<p>To become an Oracle, you must have a minimum of 10,000 PAL staked to your HIVE account. After that, you will log into the site like normal and then click on the Dashboard button on the top bar of the site. Then just click the button to opt in and become an oracle. After becoming an oracle you can find your oracle reputation on the Dashboard and you will also gain access to the Settle Markets button on the top bar of the site.</p>'
      }, {
        question: 'How Does Market Settlement Work?',
        answer: '<p>After an event ends, the market enters the Reporting phase. Oracles will then research and report the outcome of the market. After the reporting phase is finalized then 95% of the PAL held by the market is distributed to the accounts holding winning shares, 4% of the PAL is split amongst the Oracles that were chosen and validated the market, and 1% is distributed to the market creator.</p>'
      }, {
        question: 'What if I Still Have More Questions?',
        answer: '<p>Feel free to join the community Discord server and reach out to the community leaders for assistance. It’s also a great place to gather for learning and communicating with other users. We hope to see you there!</p>'
      }]
    }
  },

  head () {
    return {
      title: 'FAQ'
    }
  }
}
</script>

<style lang="scss">
.faq-answer {
  p:last-of-type {
    margin-bottom: 0;
  }
}
</style>
