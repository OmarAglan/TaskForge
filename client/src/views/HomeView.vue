<script setup>
// Note: This view is currently acting as a landing page.
// It should be updated later to be the main dashboard for logged-in users.
</script>

<template>
  <v-layout>
    <v-main class="w-auto">
      <v-container class="h-screen w-auto d-flex align-center justify-center">
        <div class="w-auto w-md-50 text-center">
          <v-chip border="thin opacity-25" color="surface" variant="flat">
            <span class="hidden-sm-and-down">{{ $t('homeView.chipMessage') }} </span>
            <a class="d-inline-block mx-1 text-decoration-none text-primary" href="/login">{{ $t('homeView.chipAction') }}</a>
          </v-chip>

          <h1 class="text-h4 text-md-h2 font-weight-bold my-6">
            {{ $t('homeView.mainHeading') }}
          </h1>

          <div class="text-body-1 text-md-h5 mb-10 text-black">
            {{ $t('homeView.subHeading') }}
          </div>

          <div class="d-flex ga-4 justify-center">
            <v-btn
              class="text-none"
              color="primary"
              flat
              rounded="lg"
              :text="$t('homeView.registerButton')"
              href="/register"
            />

            <v-btn
              append-icon="mdi-chevron-right"
              class="text-none text-black"
              flat
              rounded="lg"
              :text="$t('homeView.loginButton')"
              href="/login"
            />
          </div>
        </div>


      </v-container>
    </v-main>
  </v-layout>

  <!-- three Features -->
  <div class="d-flex justify-space-around flex-row mb-6">
    <!-- Placeholder Cards - Add translations later if these become dynamic -->
      <v-card
        class="ma-2 pa-2"
        prepend-icon="$vuetify"
        subtitle="The #1 Vue UI Library"
        width="400"
        append-icon="ass"
      >
        <template v-slot:title>
          <span class="font-weight-black">Welcome to Vuetify</span>
        </template>

        <v-card-text class="bg-surface-light pt-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, ratione debitis quis est labore voluptatibus! Eaque cupiditate minima, at placeat totam, magni doloremque veniam neque porro libero rerum unde voluptatem!
        </v-card-text>
      </v-card>
      <v-card
        class="ma-2 pa-2"
        prepend-icon="$vuetify"
        subtitle="The #1 Vue UI Library"
        width="400"
      >
        <template v-slot:title>
          <span class="font-weight-black">Welcome to Vuetify</span>
        </template>

        <v-card-text class="bg-surface-light pt-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, ratione debitis quis est labore voluptatibus! Eaque cupiditate minima, at placeat totam, magni doloremque veniam neque porro libero rerum unde voluptatem!
        </v-card-text>
      </v-card>
      <v-card
      class="ma-2 pa-2"
      prepend-icon="$vuetify"
      subtitle="The #1 Vue UI Library"
      width="400"
    >
      <template v-slot:title>
        <span class="font-weight-black">Welcome to Vuetify</span>
      </template>

      <v-card-text class="bg-surface-light pt-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, ratione debitis quis est labore voluptatibus! Eaque cupiditate minima, at placeat totam, magni doloremque veniam neque porro libero rerum unde voluptatem!
      </v-card-text>
    </v-card>
  </div>
</template>
<style scoped>
.v-bg {
  filter: blur(56px);
  pointer-events: none;
}

.v-bg > div {
  background: linear-gradient(
    to bottom right,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-error))
  );
  z-index: -10;
  clip-path: polygon(20% 50%, 27% 66%, 41% 66%, 50% 50%, 41% 34%, 27% 34%, 20% 50%, 55% 50%, 62% 66%, 76% 66%, 85% 50%, 76% 34%, 62% 34%, 55% 50%, 30% 50%, 37% 66%, 51% 66%, 60% 50%, 51% 34%, 37% 34%, 30% 50%);
}
</style>

