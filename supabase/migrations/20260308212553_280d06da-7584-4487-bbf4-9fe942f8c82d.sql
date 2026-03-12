
-- Create trigger on profiles to sync to students
CREATE TRIGGER on_profile_updated
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_to_student();

-- Create trigger on students to sync to alumni
CREATE TRIGGER on_student_status_changed
  AFTER INSERT OR UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_student_to_alumni();
