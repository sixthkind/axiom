<template>
  <MemberOnboard v-if="role == 'member'"/>
  <CounselorEdit v-if="role == 'counselor'" :onboard="true"/>
</template>

<script setup>
  import { authUtils, pb } from "#imports";
  const role = ref(pb.authStore.record?.role);

  // refresh user state
  await authUtils.refresh();

  if(pb.authStore.record?.isOnboarded) {
    window.location.href = "/";
  }

  if(pb.authStore.record?.role == "member") {
    onboardMember();
  } else if (pb.authStore.record?.role == "agent") {
    onboardAgent();
  } else if (pb.authStore.record?.role == "counselor") {
    onboardCounselor();
  }

  async function onboardCounselor() {
    
  }

  async function onboardAgent() {
    // TODO: implement agent onboarding
  }

  async function onboardMember() {
    // window.location.href = "/member/onboarding";
  }

  // async function initFormbricks() {
  //   if (typeof window !== "undefined") {
  //     await formbricks.init({
  //       environmentId: formbricksID,
  //       apiHost: formbricksURL,
  //       userId: pb.authStore.record?.id,
  //       attributes: {
  //         email: pb.authStore.record?.email,
  //         role: pb.authStore.record?.role,
  //         firstName: pb.authStore.record?.firstName,
  //         lastName: pb.authStore.record?.lastName,
  //       },
  //     });
  //     // formbricks.track("signupform");
  //   }
  // }

</script>