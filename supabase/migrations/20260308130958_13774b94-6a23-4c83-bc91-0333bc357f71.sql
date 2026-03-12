-- Reassign students with the stray "aiml" branch to Engineering & Technology in the same college
UPDATE public.students 
SET branch_id = '5cacd5cc-04bb-4886-9818-d25719b1bf81'
WHERE branch_id = '48e69193-c826-473d-b7f2-3a36890868c3';

-- Delete the stray "aiml" branch
DELETE FROM public.branches WHERE id = '48e69193-c826-473d-b7f2-3a36890868c3';