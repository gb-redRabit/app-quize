import { computed } from 'vue';
import { useRoute } from 'vue-router';

export function useSkeletonConfig() {
  const route = useRoute();

  const skeletonVariant = computed(() => {
    const path = route.path;
    if (path.includes('/quiz') || path.includes('/exam')) return 'question';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/history')) return 'article';
    return 'default';
  });

  const skeletonCardCount = computed(() => {
    const path = route.path;
    if (path.includes('/categories')) return 8;
    if (path.includes('/questions')) return 5;
    return 3;
  });

  const showSkeletonCards = computed(() => {
    const path = route.path;
    return !path.includes('/profile') && !path.includes('/settings');
  });

  const getLineWidths = computed(() => {
    const path = route.path;
    if (path.includes('/history')) return ['100%', '90%', '95%', '85%', '70%'];
    if (path.includes('/questions')) return ['80%', '100%', '95%', '90%'];
    if (path.includes('/quiz') || path.includes('/exam')) return ['90%', '45%', '45%', '45%'];
    return ['67%', '45%', '78%', '60%'];
  });

  const skeletonContainerClass = computed(() => {
    const path = route.path;
    if (path.includes('/profile')) return 'max-w-4xl mx-auto p-6';
    if (path.includes('/quiz') || path.includes('/exam')) return 'max-w-3xl mx-auto p-4';
    if (path.includes('/admin')) return 'container mx-auto p-6';
    return 'container mx-auto p-4';
  });

  const skeletonGridCols = computed(() => {
    const path = route.path;
    if (path.includes('/categories') || path.includes('/home'))
      return 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    if (path.includes('/questions')) return 'grid-cols-1';
    if (path.includes('/history')) return 'grid-cols-1 md:grid-cols-2';
    return 'sm:grid-cols-2 lg:grid-cols-3';
  });

  const showSkeletonHeader = computed(() => {
    const path = route.path;
    return !path.includes('/quiz') && !path.includes('/exam');
  });

  const showSkeletonSubtitle = computed(() => {
    const path = route.path;
    return path.includes('/home') || path.includes('/categories') || path.includes('/history');
  });

  const showSkeletonLines = computed(() => {
    const path = route.path;
    return !path.includes('/categories') || path.includes('/home');
  });

  return {
    skeletonVariant,
    skeletonCardCount,
    showSkeletonCards,
    getLineWidths,
    skeletonContainerClass,
    skeletonGridCols,
    showSkeletonHeader,
    showSkeletonSubtitle,
    showSkeletonLines,
  };
}
