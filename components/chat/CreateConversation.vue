<template>
  <b-modal id="createConversation" title="New Conversation">
    <b-form-group>
      <b-form-radio-group
        v-model="type"
        size="sm"
        button-variant="outline-secondary"
        :options="[
          { text: 'DM', value: 'dm' },
          { text: 'Group', value: 'group' },
        ]"
        buttons
      />
    </b-form-group>

    <b-form-group v-if="type === 'dm'" label="Recipient">
      <b-form-input
        v-model.trim="member"
        placeholder="Hive username"
        :state="$v.member.$dirty ? !$v.member.$error : null"
      />
    </b-form-group>

    <b-form-group v-if="type === 'group'" label="Recipients">
      <b-form-tags
        v-model="members"
        :state="$v.members.$dirty ? !$v.members.$error : null"
        disabled
        input-id="members-tags"
        placeholder
      />

      <div class="friendlist">
        <template v-if="friends.length > 0">
          <b-form-checkbox-group
            v-model="members"
            stacked
            :options="friends"
            name="members"
          />
        </template>

        <template v-else>
          <p class="text-center">
            No friends found. You can only create group chat with friends.
          </p>
        </template>
      </div>
    </b-form-group>

    <b-form-group label="Message" label-for="message">
      <b-form-textarea
        id="message"
        v-model.trim="message"
        :state="$v.message.$dirty ? !$v.message.$error : null"
      />
    </b-form-group>

    <template #modal-footer>
      <b-button
        variant="primary"
        :disabled="disableCreate"
        @click.prevent="createNewConversation"
      >
        Create
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { required, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  name: 'CreateConversation',

  data () {
    return {
      type: 'dm',
      member: '',
      members: [],
      message: ''
    }
  },

  computed: {
    ...mapGetters('user', ['username']),
    ...mapGetters('message', ['friends', 'recipient']),

    disableCreate () {
      let disabled = false

      disabled = this.message === ''

      if (this.type === 'group') {
        disabled = this.members.length < 2
      } else if (this.type === 'dm') {
        disabled = this.member === ''
      }

      return disabled
    }
  },

  async created () {
    if (!this.friends || !this.friends.length <= 0) {
      await this.fetchFriends()
    }
  },

  validations: {
    member: {
      required,
      minLength: minLength(3),
      maxLength: maxLength(16),
      validUsername: (value) => {
        if (value === '') { return true }

        return /^([a-z])[a-z0-9-.]*$/.test(value)
      }
    },

    members: {
      required,
      minLength: minLength(2)
    },

    message: {
      required,
      minLength: minLength(1)
    }
  },

  mounted () {
    const self = this

    this.$root.$on('bv::modal::show', (bvEvent, modalId) => {
      if (modalId === 'createConversation') {
        if (self.recipient) { self.member = self.recipient }
      }
    })

    this.$root.$on('bv::modal::hidden', (bvEvent, modalId) => {
      if (modalId === 'createConversation') {
        self.member = ''
        self.members = []
        self.message = ''

        self.SET_RECIPIENT('')
      }
    })
  },

  methods: {
    ...mapActions('message', ['broadcastMessage', 'fetchFriends']),
    ...mapMutations('message', ['SET_RECIPIENT']),

    createNewConversation () {
      if (this.type === 'dm') {
        this.$v.member.$touch()
      } else {
        this.$v.members.$touch()
      }

      this.$v.message.$touch()

      if (
        ((this.type === 'dm' && !this.$v.member.$invalid) || (this.type === 'group' && !this.$v.members.$invalid)) &&
        !this.$v.message.$invalid
      ) {
        this.broadcastMessage({
          type: 'create-conversation',
          payload: {
            to: this.type === 'group' && this.members.length > 1 ? this.members : this.member,
            message: this.message
          }
        })

        this.members = []
        this.to = ''
        this.message = ''

        this.$v.$reset()

        this.$bvModal.hide('createConversation')

        this.$router.push({ name: 'user-messages', params: { user: this.username } })
      }
    }
  }
}
</script>

<style lang="scss">
.friendlist {
  margin-top: 20px;
  position: relative;
  overflow-x: hidden;
  overflow-y: scroll;
  max-height: 150px;

  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: #f0f0f0;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #cdcdcd;
  }
}
</style>
