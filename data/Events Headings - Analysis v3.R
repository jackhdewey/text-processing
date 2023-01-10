library(BayesFactor)
library(ez)
library(GGally)
library(ggbeeswarm)
library(ggplot2)
library(ggpubr)
library(gridExtra)
library(gtools)
library(lsr)
library(psych)
library(pwr)
library(svMisc)
library(tidyverse)
rm(list = ls())

# Joan Danielle K. Ongchoco
# This code analyzes data for the Headings experiments.

# CLEAN DATA ################################################################

# Locate all .csv files in local folder
filenames = list.files(pattern=".csv") 
# Apply read.csv to all .csv files and output to ad
ad = do.call("smartbind",lapply(filenames, read.csv, header=TRUE)) 

# Get all unique subjects as string
ad$subj_id = as.character(ad$subj_id)
included_subjects = unique(ad$subj_id[ad$test_part=='debrief'])

# Get debriefing responses
# Filter ad by test_part (debrief), then select only the data we want (using dplyr package)
codes = ad %>% filter(test_part == 'debrief') %>% 
  dplyr::select(subj_id, time_elapsed, resp_attention, resp_final, completion_code)
codes$time_elapsed = codes$time_elapsed/1000/60 # Convert time elapsed to minutes
median(codes$time_elapsed) # Calculate median

######################################################################
# IDENTIFY VARIABLES
# PREDICTORS: subj_id, expt_condition, scroll_time, scroll_depth
# TARGETS: total_scrolls, total_time, total_reversals, error_detection,
# scroll_speed (scroll_depth / time)
# scroll_depth = position on the article
# scroll_time = time elapsed since start

# This selects the columns we want to look at
# You can add other columns you want to look at by adding to the list after "select"

test_data = ad %>% filter(test_part=='test_trial') %>%
  select(subj_id, expt_condition, total_reading_time, total_scrolls, num_scrolls_up,
         scroll_type, scroll_time, scroll_duration, scroll_depth, onscreen_at_scroll,
         heading_depths, clicked_typo_locations, clicked_typo_times, 
         typos_per_paragraph, num_typos_found)
test_data$total_reading_time = test_data$total_reading_time/1000/60 

# Convert arrays to strings
test_data$scroll_type = as.character(test_data$scroll_type)
test_data$scroll_time = as.character(test_data$scroll_time)
test_data$scroll_depth = as.character(test_data$scroll_depth)
test_data$scroll_duration = as.character(test_data$scroll_duration)
test_data$onscreen_at_scroll = as.character(test_data$onscreen_at_scroll)
test_data$heading_depths = as.character(test_data$heading_depths)
test_data$clicked_typo_locations = as.character(test_data$clicked_typo_locations)
test_data$clicked_typo_times = as.character(test_data$clicked_typo_times)
test_data$typos_per_paragraph = as.character(test_data$typos_per_paragraph)
test_data$num_typos_found = as.character(test_data$num_typos_found)

# Split the strings into distinct data points at each comma
test_data$scroll_type = strsplit(test_data$scroll_type, ',')
test_data$scroll_time = strsplit(test_data$scroll_time, ',')
test_data$scroll_depth = strsplit(test_data$scroll_depth, ',')
test_data$scroll_duration = strsplit(test_data$scroll_duration, ',')
test_data$onscreen_at_scroll = strsplit(test_data$onscreen_at_scroll, ',')
test_data$heading_depths = strsplit(test_data$heading_depths, ',')
test_data$clicked_typo_locations = strsplit(test_data$clicked_typo_locations, ',')
test_data$clicked_typo_times = strsplit(test_data$clicked_typo_times, ',')
test_data$typos_per_paragraph = strsplit(test_data$typos_per_paragraph, ',')
test_data$num_typos_found = strsplit(test_data$num_typos_found, ',')

# Transpose data from rows to columns
test_data_t = data.frame()
test_data_c = data.frame()
for (i in 1:nrow(test_data)){
  subject = test_data$subj_id[i]
  expt_condition = test_data$expt_condition[i]
  subject_data = test_data %>% filter(subj_id == subject)
  subject_data_t = data.frame(unlist(subject_data$scroll_type), 
                          unlist(subject_data$scroll_time),
                          unlist(subject_data$scroll_depth),
                          unlist(subject_data$scroll_duration,
                          unlist(subject_data$onscreen_at_scroll)))
  subject_data_t$subj_id = subject
  subject_data_t$expt_condition = expt_condition
  colnames(subject_data_t) = c("scroll_type", "scroll_time", "scroll_depth", "scroll_duration", "subj_id", "expt_condition")
  
  subject_data_t$scroll_time = as.numeric(as.character(subject_data_t$scroll_time))
  subject_data_t$scroll_depth = as.numeric(as.character(subject_data_t$scroll_depth))
  subject_data_t$scroll_duration = as.numeric(as.character(subject_data_t$scroll_duration))
  
  subject_data_t$scroll_time_norm = subject_data_t$scroll_time / subject_data_t$scroll_time[nrow(subject_data_t)]
  
  test_data_t = rbind(test_data_t, subject_data_t) #concatenate
}

# Get the difference between a trial's scroll depth and the one before
test_data_t$depth_diff = 0
for (i in 1:nrow(test_data_t)){
  # return true if there is a h in this item
  test_data_t$is_heading[i] = grepl("(h", test_data_t$onscreen_at_scroll[i], fixed=TRUE)
  
  if (test_data_t$scroll_duration[i] > 0){
    test_data_t$depth_diff[i] = abs(test_data_t$scroll_depth[i] - test_data_t$scroll_depth[i-1])
  }
}

# Analyze the data involving typos
for (i in 1:nrow(test_data)){
  subject = test_data$subj_id[i]
  expt_condition = test_data$expt_condition[i]
  subject_data = test_data %>% filter(subj_id == subject)
  
  typos_per_paragraph = unlist(subject_data$typos_per_paragraph)
  num_typos_found = unlist(subject_data$num_typos_found)
  
  # Not sure what's happening here - why the 0 and 17?
  if (length(typos_per_paragraph)==26){
    typos_per_paragraph = append(typos_per_paragraph, 0, 17)
    num_typos_found = append(num_typos_found, 0, 17)
  }
  
  # If there is an NaN, exclude this column
  if ("NaN" %in% num_typos_found){
    num_typos_found[num_typos_found=="NaN"] = NA
  }
  num_typos_found = na.omit(num_typos_found)
  
  subject_data_c = data.frame(unlist(typos_per_paragraph), unlist(num_typos_found))
  subject_data_c$subj_id = subject
  subject_data_c$expt_condition = expt_condition
  subjectdata_c$p_number = c(1:nrow(subject_data_c)) # What is p_number?
  colnames(subject_data_c) = c("typos_per_paragraph", "num_typos_found", "subj_id", "expt_condition", "p_number")
  subject_data_c$typos_per_paragraph = as.numeric(as.character(subject_data_c$typos_per_paragraph))
  subject_data_c$num_typos_found = as.numeric(as.character(subject_data_c$num_typos_found))
  
  for (j in 1:nrow(subject_data_c)){
    if (subject_data_c$num_typos_found[j] > subject_data_c$typos_per_paragraph[j]){
      subject_data_c$num_typos_found[j] = subject_data_c$typos_per_paragraph[j]
    }
  }
  
  # Define prop_found and add to the data
  subject_data_c$prop_found = subject_data_c$num_typos_found / subject_data_c$typos_per_paragraph
  subject_data_c$prop_found[is.na(subject_data_c$prop_found)] = 0
  test_data_c = rbind(test_data_c, subject_data_c)
}

h_depths = unlist(test_data$heading_depths[1])
h_depths = as.numeric(h_depths)
before_h_numbers = c(6, 10, 12, 15, 20)
h_numbers = c(7, 11, 13, 16, 21)

# edit(test_data_t)

######################################################################
# UNIVARIATES (Starting with actual statistics)

# Look at individual trials
mean_data = test_data_t %>% 
  filter(scroll_duration > 0) %>%
  select(scroll_duration, depth_diff)

# Print out the means, SDs, mins and maxes
lapply(mean_data, mean, na.rm = T)
lapply(mean_data, sd, na.rm = T)
lapply(mean_data, min, na.rm = T)
lapply(mean_data, max, na.rm = T)

hist(mean_data$scroll_duration)
hist(mean_data$depth_diff)

# Trial-level exclusions
test_data_t = test_data_t %>% 
  filter(scroll_duration < 50,
         depth_diff < 5)

# Look at individual subjects
get_sub_data = function(test_data_t, test_data_c){
  # Function takes in long data,
  mean_data = test_data_t %>% filter(scroll_duration > 0) %>%
    group_by(subj_id, expt_condition) %>%
    summarize(depth_diff = mean(depth_diff), 
              scroll_duration = mean(scroll_duration),
              total_scrolls = n())
  
  sub_data_early = test_data_t %>% filter(scroll_depth < 50) %>%
    group_by(subj_id, expt_condition) %>%
    summarize(depth_diff=mean(depth_diff))
  sub_data_late = test_data_t %>% filter(scroll_depth > 50) %>%
    group_by(subj_id, expt_condition) %>%
    summarize(depth_diff=mean(depth_diff))
  mean_data$depth_early = sub_data_early$depth_diff
  mean_data$depth_late = sub_data_late$depth_diff
  mean_data$depth_change = mean_data$depth_early - mean_data$depth_late
  
  sub_data_corr = test_data_c %>%
    group_by(subj_id, expt_condition) %>%
    summarize(prop_found=mean(prop_found))
  sub_data_corr_bef = test_data_c %>% filter(p_number %in% c(before_h_numbers)) %>%
    group_by(subj_id, expt_condition) %>%
    summarize(prop_found=mean(prop_found))
  sub_data_corr_aft = test_data_c %>% filter(p_number %in% c(h_numbers)) %>%
    group_by(subj_id, expt_condition) %>%
    summarize(prop_found=mean(prop_found))
  mean_data$overall_prop = sub_data_corr$prop_found
  mean_data$bef_prop = sub_data_corr_bef$prop_found
  mean_data$aft_prop = sub_data_corr_aft$prop_found
  return(mean_data)
}

mean_sub_data = get_sub_data(test_data_t, test_data_c)

# Subject-level exclusions
attn_level = 60
rm_attn = sum(codes$resp_attention < attn_level)
included_data = codes %>% filter(resp_attention >= attn_level)
included_subjects = unique(included_data$subj_id)
mean_sub_data = mean_sub_data %>% filter(subj_id %in% included_subjects)
test_data_t = test_data_t %>% filter(subj_id %in% included_subjects)
test_data_c = test_data_c %>% filter(subj_id %in% included_subjects)

# time_level = mean(codes$time_elapsed) + 2*sd(codes$time_elapsed)
# rm_time = sum(codes$time_elapsed > time_level)
# included_data = codes %>% filter(time_elapsed <= time_level)
# included_subjects = unique(included_data$subj_id)
# mean_sub_data = mean_sub_data %>% filter(subj_id %in% included_subjects)
# test_data_t = test_data_t %>% filter(subj_id %in% included_subjects)
# test_data_c = test_data_c %>% filter(subj_id %in% included_subjects)

det_level = mean(mean_sub_data$overall_prop) - 2*sd(mean_sub_data$overall_prop)
rm_det = sum(mean_sub_data$overall_prop < det_level)
included_data = mean_sub_data %>% filter(overall_prop >= det_level)
included_subjects = unique(included_data$subj_id)
mean_sub_data = mean_sub_data %>% filter(subj_id %in% included_subjects)
test_data_t = test_data_t %>% filter(subj_id %in% included_subjects)
test_data_c = test_data_c %>% filter(subj_id %in% included_subjects)

num_scrolls_level = mean(mean_sub_data$total_scrolls) + 2*sd(mean_sub_data$total_scrolls)
rm_scrolls = sum(mean_sub_data$total_scrolls > num_scrolls_level)
included_data = mean_sub_data %>% filter(total_scrolls <= num_scrolls_level)
included_subjects = unique(included_data$subj_id)
mean_sub_data = mean_sub_data %>% filter(subj_id %in% included_subjects)
test_data_t = test_data_t %>% filter(subj_id %in% included_subjects)
test_data_c = test_data_c %>% filter(subj_id %in% included_subjects)

# dur_level = mean(mean_sub_data$scroll_duration) + 2*sd(mean_sub_data$scroll_duration)
# rm_dur = sum(mean_sub_data$scroll_duration > dur_level)
# included_data = mean_sub_data %>% filter(scroll_duration <= dur_level)
# included_subjects = unique(included_data$subj_id)
# mean_sub_data = mean_sub_data %>% filter(subj_id %in% included_subjects)
# test_data_t = test_data_t %>% filter(subj_id %in% included_subjects)
# test_data_c = test_data_c %>% filter(subj_id %in% included_subjects)

# Final subject means
mean_sub_data = get_sub_data(test_data_t, test_data_c)
lapply(mean_sub_data[3:5], mean, na.rm = T)
lapply(mean_sub_data[3:5], sd, na.rm = T)
lapply(mean_sub_data[3:5], min, na.rm = T)
lapply(mean_sub_data[3:5], max, na.rm = T)

head_data = mean_sub_data %>% filter(expt_condition=='heading')
nohead_data = mean_sub_data %>% filter(expt_condition=='no_heading')
head_data = head_data[1:25,]
nohead_data = nohead_data[1:25,]
mean_sub_data = rbind(head_data, nohead_data)
included_subs = unique(mean_sub_data$subj_id)
test_data_t = test_data_t %>% filter(subj_id %in% included_subs)
test_data_c = test_data_c %>% filter(subj_id %in% included_subs)

# Look at key comparisons
mean_sub_data %>%
  ggplot(aes(expt_condition, depth_change, fill=expt_condition)) + 
  geom_boxplot(size=0.5, width=0.6) + 
  geom_dotplot(method="histodot", binaxis = 'y', stackdir = 'center', alpha=0.8, na.rm = TRUE) + 
  stat_summary(fun.y = "mean", geom="segment", mapping=aes(xend=..x.. - 0.25, yend=..y..), size=2) +
  stat_summary(fun.y = "mean", geom="segment", mapping=aes(xend=..x.. + 0.25, yend=..y..), size=2) +
  scale_fill_manual(values=c("#6667AB", "#b5c7d3")) +
  theme_test() + 
  theme(aspect.ratio=1.75, 
        legend.title=element_blank(), 
        legend.position="none", 
        axis.ticks=element_blank(),
        axis.title.x=element_text(face="bold"), 
        axis.title.y=element_text(face="bold"), 
        text=element_text(size=16, family="Helvetica"))

######################################################################
# BIVARIATES

test_data_t %>% group_by(subj_id, expt_condition, scroll_depth) %>%
  summarize(depth_diff = mean(depth_diff)) %>%
  ggplot(aes(scroll_depth, depth_diff, color=expt_condition)) + 
  geom_vline(xintercept=h_depths, color="lightgrey") + 
  geom_line(size=1) +
  scale_fill_manual(values=c("#6667AB", "#b5c7d3")) +
  theme_test() + facet_wrap(~subj_id) + 
  theme(aspect.ratio=0.5, 
        legend.title=element_blank(), 
        legend.position="bottom", 
        axis.ticks = element_blank(),
        axis.title.x=element_text(face="bold"), 
        axis.title.y=element_text(face="bold"), 
        text=element_text(size=16, family="Helvetica"))

test_data_t %>% group_by(subj_id, expt_condition) %>%
  ggplot(aes(scroll_time_norm, scroll_depth, color=expt_condition)) + 
  geom_hline(yintercept=h_depths, color="lightgrey") + 
  geom_point() + 
  scale_fill_manual(values=c("#6667AB", "#b5c7d3")) +
  theme_test() + facet_wrap(~subj_id) + 
  theme(aspect.ratio=0.5, 
        legend.title=element_blank(), 
        legend.position="bottom", 
        axis.ticks = element_blank(),
        axis.title.x=element_text(face="bold"), 
        axis.title.y=element_text(face="bold"), 
        text=element_text(size=16, family="Helvetica"))

######################################################################
# KEY NUMS

t.test(mean_sub_data$depth_diff[mean_sub_data$expt_condition=='heading'],
       mean_sub_data$depth_diff[mean_sub_data$expt_condition=='no_heading'])
cohensD(mean_sub_data$depth_diff[mean_sub_data$expt_condition=='heading'],
        mean_sub_data$depth_diff[mean_sub_data$expt_condition=='no_heading'])

mean_sub_data %>% group_by(expt_condition) %>% summarize(total=n())
